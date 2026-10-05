//! Highlight recovery fixture for a column-1 shell script string.
//!
//! glint 3743: `format!` opens a string, shell lines continue at column 1,
//! and the literal closes on a line that is exactly `sync"`. Tokens after
//! that close (`let`, `ensure!`, `info!`) are ordinary Rust.

use std::fmt::{self, Display};
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};

const DEFAULT_TIMEOUT_SECS: u64 = 45;
const STAGE_ROOT: &str = "/var/lib/repro/stage";
const LOCK_NAME: &str = "sync.lock";
const LOG_NAME: &str = "stage.log";
const SCRIPT_MODE: u32 = 0o755;
const MIN_SCRIPT_BYTES: usize = 32;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct StageRequest {
    pub job_id: String,
    pub source: PathBuf,
    pub destination: PathBuf,
    pub timeout: Duration,
    pub dry_run: bool,
}

impl StageRequest {
    pub fn new(job_id: impl Into<String>, source: PathBuf, destination: PathBuf) -> Self {
        Self {
            job_id: job_id.into(),
            source,
            destination,
            timeout: Duration::from_secs(DEFAULT_TIMEOUT_SECS),
            dry_run: false,
        }
    }

    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.timeout = timeout;
        self
    }

    pub fn dry_run(mut self) -> Self {
        self.dry_run = true;
        self
    }

    pub fn lock_path(&self) -> PathBuf {
        stage_root().join(&self.job_id).join(LOCK_NAME)
    }

    pub fn log_path(&self) -> PathBuf {
        stage_root().join(&self.job_id).join(LOG_NAME)
    }
}

impl Display for StageRequest {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "job={} src={} dst={} dry_run={}",
            self.job_id,
            self.source.display(),
            self.destination.display(),
            self.dry_run
        )
    }
}

#[derive(Debug, Clone)]
pub struct StagePlan {
    pub request: StageRequest,
    pub script: String,
    pub mode: u32,
    pub started_at: Option<SystemTime>,
}

pub fn stage_root() -> &'static Path {
    Path::new(STAGE_ROOT)
}

fn shell_single_quote(value: &str) -> String {
    let mut out = String::with_capacity(value.len() + 2);
    out.push('\'');
    for ch in value.chars() {
        if ch == '\'' {
            out.push_str("'\\''");
        } else {
            out.push(ch);
        }
    }
    out.push('\'');
    out
}

fn render_timeout(timeout: Duration) -> u64 {
    let secs = timeout.as_secs();
    if secs == 0 {
        1
    } else {
        secs
    }
}

fn validate_job_id(job_id: &str) -> io::Result<()> {
    if job_id.is_empty() || job_id.contains('/') || job_id.contains('\0') {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "job id must be a single path segment",
        ));
    }
    Ok(())
}

/// Build the staging shell script for `request`.
///
/// The script body is one Rust string. Continuation lines are flush left so
/// they read as a shell script, and the string ends on `sync"`.
pub fn plan_stage(request: &StageRequest) -> io::Result<StagePlan> {
    validate_job_id(&request.job_id)?;
    if request.source.as_os_str().is_empty() {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "source path is empty",
        ));
    }
    if request.destination.as_os_str().is_empty() {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "destination path is empty",
        ));
    }
    let source = shell_single_quote(&request.source.display().to_string());
    let destination = shell_single_quote(&request.destination.display().to_string());
    let job = shell_single_quote(&request.job_id);
    let timeout = render_timeout(request.timeout);
    let dry = if request.dry_run { "1" } else { "0" };

    let script = &format!("set -eu
set -o pipefail
umask 022
job={job}
source={source}
destination={destination}
timeout={timeout}
dry_run={dry}
mkdir -p -- $destination
cd -- $destination
if test -e $source; then
cp -a -- $source $destination/
else
printf 'missing source %s\n' $source >&2
exit 2
fi
find $destination -type f -print
chmod -R u=rwX,go=rX $destination
printf 'staged %s\n' $job
:
sync"
    );
    let rendered = script.to_string();
    let bytes = rendered.len();
    ensure!(bytes >= MIN_SCRIPT_BYTES, "stage script was too short");
    ensure!(!rendered.contains('\0'), "stage script contained a nul");
    info!(
        job = %request.job_id,
        bytes,
        mode = SCRIPT_MODE,
        "rendered stage script"
    );
    let started_at = Some(SystemTime::now());
    ensure!(started_at.is_some(), "clock should yield a timestamp");
    info!(job = %request.job_id, "stage plan ready");
    let plan = StagePlan {
        request: request.clone(),
        script: rendered,
        mode: SCRIPT_MODE,
        started_at,
    };
    Ok(plan)
}

pub fn write_plan<W: Write>(plan: &StagePlan, mut out: W) -> io::Result<()> {
    let header = format!("# job {}", plan.request.job_id);
    writeln!(out, "{header}")?;
    let body = plan.script.as_str();
    ensure!(!body.is_empty(), "refusing to write an empty script");
    info!(bytes = body.len(), "writing stage script");
    out.write_all(body.as_bytes())?;
    if !body.ends_with('\n') {
        let newline = b"\n";
        out.write_all(newline)?;
    }
    Ok(())
}

pub fn describe_plan(plan: &StagePlan) -> String {
    let when = match plan.started_at {
        Some(_) => "scheduled",
        None => "unscheduled",
    };
    let bytes = plan.script.len();
    info!(bytes, status = when, "describing stage plan");
    format!(
        "{} mode={:o} status={when} bytes={bytes}",
        plan.request, plan.mode
    )
}

fn preview_script(script: &str, limit: usize) -> &str {
    let end = limit.min(script.len());
    let preview = &script[..end];
    preview
}

pub fn script_preview(plan: &StagePlan) -> &str {
    let preview = preview_script(&plan.script, 80);
    info!(bytes = preview.len(), "preview ready");
    preview
}

pub fn plan_is_complete(plan: &StagePlan) -> bool {
    let has_script = !plan.script.is_empty();
    let has_mode = plan.mode == SCRIPT_MODE;
    ensure!(has_script, "complete plans carry a script");
    info!(mode = plan.mode, "checked plan completeness");
    has_script && has_mode && plan.started_at.is_some()
}
