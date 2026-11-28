#!/bin/bash
# 시뮬레이터에서 앱을 띄워 위젯 그림(out/widgets-*.png) · 앱 화면(out/app-*.png) · 자체 시험(out/selftest.txt)을 남긴다.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
[ -d MateToday.xcodeproj ] || xcodegen generate
ID=kr.co.devteammate.today

set +e
xcodebuild -project MateToday.xcodeproj -scheme MateToday -configuration Debug \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath build/sim \
  CODE_SIGN_IDENTITY=- \
  build > out/sim.log 2>&1
code=$?
set -e
grep -E "error:|BUILD (SUCCEEDED|FAILED)" out/sim.log | sort -u | head -150 > out/sim-errors.txt || true
if [ $code -ne 0 ]; then
  cat out/sim-errors.txt
  exit $code
fi
APP=build/sim/Build/Products/Debug-iphonesimulator/MateToday.app

# 가장 새 iOS 의 iPhone 하나
UDID=$(xcrun simctl list devices available -j | python3 -c '
import json, sys
best = None
for runtime, devices in sorted(json.load(sys.stdin)["devices"].items()):
    if "iOS" not in runtime:
        continue
    for d in devices:
        if d["name"].startswith("iPhone") and "SE" not in d["name"]:
            best = d
            break
print(best["udid"] if best else "")
')
[ -n "$UDID" ] || { echo "시뮬레이터가 없습니다"; exit 1; }
xcrun simctl list devices available | grep "$UDID" | tee out/simulator.txt

xcrun simctl boot "$UDID" || true
xcrun simctl bootstatus "$UDID" -b
xcrun simctl install "$UDID" "$APP"

# 1) 위젯 그림 · 자체 시험. 로그인 전 화면도 이때 찍는다
xcrun simctl launch "$UDID" "$ID" -snapshot
DATA=$(xcrun simctl get_app_container "$UDID" "$ID" data)
for _ in $(seq 1 60); do
  [ -f "$DATA/Documents/snap/done.txt" ] && break
  sleep 2
done
cp "$DATA"/Documents/snap/* out/ || true
xcrun simctl io "$UDID" screenshot out/app-login.png

# 2) 로그인한 화면(보기용 값) - 밝은 화면 · 어두운 화면
xcrun simctl terminate "$UDID" "$ID" || true
xcrun simctl launch "$UDID" "$ID" -demo
sleep 12
xcrun simctl io "$UDID" screenshot out/app-demo-light.png
xcrun simctl ui "$UDID" appearance dark
sleep 3
xcrun simctl io "$UDID" screenshot out/app-demo-dark.png
xcrun simctl ui "$UDID" appearance light
xcrun simctl shutdown "$UDID" || true

[ -f out/done.txt ] || { echo "자체 시험이 끝나지 않았습니다"; exit 1; }
cat out/selftest.txt
