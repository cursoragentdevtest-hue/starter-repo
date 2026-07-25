# Instrumentation snippets

Copy-paste log writes for the `debug-mode` skill. Substitute `LOGPATH` with the
path resolved in `SKILL.md` (`/opt/cursor/logs/debug.log`, or
`${TMPDIR:-/tmp}/cursor-debug/debug.log`).

Every snippet emits one NDJSON line with the keys `timestamp`, `location`,
`message`, `data`, and `hypothesisId`, and is wrapped in a region tagged
`agent log` so `rg "agent log"` finds it at cleanup time.

## Why inline rather than a shared helper

The default is to inline the write at every site using only the standard
library, opening the file in append mode and closing it immediately. This runs
against normal engineering instinct, for three reasons:

- A helper module is a new file that must itself be cleaned up, and gets forgotten.
- A helper needs importing, which means touching import blocks in every instrumented file and risking circular imports.
- A helper will not exist yet in a process that crashed before initialisation.

Inline writes are self-contained and survive being dropped anywhere, including a
module's top-level scope or a signal handler.

## Cross-cutting rules

- Single-line `O_APPEND` writes are atomic enough for concurrent processes sharing one file, which is what makes a single path viable across a server, a worker, and a test harness at once.
- Prefer synchronous writes. An async write can lose the last entries when the process exits or crashes — precisely the moment that matters.
- Errors are deliberately swallowed so instrumentation can never change control flow.

## Node

```js
// #region agent log
require('fs').appendFileSync('LOGPATH',JSON.stringify({location:'session.ts:88',message:'token refresh branch taken',data:{userId,expiresIn},timestamp:Date.now(),hypothesisId:'B'})+'\n');
// #endregion
```

In ESM files without `require`, either use an existing `fs` import or
`createRequire(import.meta.url)`.

## Browser JavaScript

No filesystem, so this is the one case that needs a channel. In order of
preference:

```js
// #region agent log
fetch('/__debug',{method:'POST',keepalive:true,body:JSON.stringify({location:'cart.tsx:44',message:'discount applied',data:{total,code},timestamp:Date.now(),hypothesisId:'A'})});
// #endregion
```

`keepalive` matters so unload-time logs survive. Point `/__debug` at a small
append handler on the existing dev server. If the app already round-trips to the
server for something, piggyback on that instead. As a last resort:

```js
// #region agent log
console.log('AGENTLOG '+JSON.stringify({location:'cart.tsx:44',message:'discount applied',data:{total,code},timestamp:Date.now(),hypothesisId:'A'}));
// #endregion
```

and have the console output pasted back. The record shape is identical either
way, so analysis is unchanged.

## Python

```python
# region agent log
import json,time; open('LOGPATH','a').write(json.dumps({"location":"session.py:88","message":"token refresh branch taken","data":{"user_id":user_id,"expires_in":expires_in},"timestamp":int(time.time()*1000),"hypothesisId":"B"})+"\n")
# endregion
```

CPython closes the handle on refcount drop and flushes the buffer. If the
process may be killed by a signal, use an explicit `with` block.

## Go

```go
//region agent log
func() { f, _ := os.OpenFile("LOGPATH", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); b, _ := json.Marshal(map[string]any{"location": "session.go:88", "message": "token refresh branch taken", "data": map[string]any{"userID": userID}, "timestamp": time.Now().UnixMilli(), "hypothesisId": "B"}); f.Write(append(b, '\n')); f.Close() }()
//endregion
```

## Ruby

```ruby
# region agent log
File.open('LOGPATH','a'){|f| f.write(JSON.dump({location:'session.rb:88',message:'token refresh branch taken',data:{user_id: user_id},timestamp:(Time.now.to_f*1000).to_i,hypothesisId:'B'})+"\n")}
# endregion
```

## PHP

```php
// #region agent log
file_put_contents('LOGPATH', json_encode(['location'=>'Session.php:88','message'=>'token refresh branch taken','data'=>['userId'=>$userId],'timestamp'=>(int)(microtime(true)*1000),'hypothesisId'=>'B'])."\n", FILE_APPEND);
// #endregion
```

## Java

```java
// #region agent log
try { java.nio.file.Files.write(java.nio.file.Paths.get("LOGPATH"), ("{\"location\":\"Session.java:88\",\"message\":\"token refresh branch taken\",\"data\":{\"userId\":" + userId + "},\"timestamp\":" + System.currentTimeMillis() + ",\"hypothesisId\":\"B\"}\n").getBytes(), java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND); } catch (Exception ignored) {}
// #endregion
```

## Rust

```rust
// #region agent log
{ use std::io::Write; if let Ok(mut f) = std::fs::OpenOptions::new().append(true).create(true).open("LOGPATH") { let _ = writeln!(f, r#"{{"location":"session.rs:88","message":"token refresh branch taken","data":{{"user_id":{}}},"timestamp":{},"hypothesisId":"B"}}"#, user_id, std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis()); } }
// #endregion
```

## Shell

```bash
# region agent log
echo "{\"location\":\"deploy.sh:12\",\"message\":\"entering retry branch\",\"data\":{\"attempt\":$attempt},\"timestamp\":$(date +%s%3N),\"hypothesisId\":\"C\"}" >> LOGPATH
# endregion
```

`date +%s%3N` is GNU coreutils. On BSD/macOS use `$(($(date +%s) * 1000))`.

## Reading the log back

```bash
cat LOGPATH                      # whole run, newest last
rg '"hypothesisId":"B"' LOGPATH  # entries for one hypothesis
rg "agent log"                   # every instrumentation site, for cleanup
```
