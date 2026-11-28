#!/bin/bash
# 기기용으로 빌드해 서명하지 않은 IPA(out/MATE-Today.ipa)를 만든다. Mac · Xcode · XcodeGen 이 있어야 한다.
# 서명은 깔 때 한다(Sideloadly · AltStore 가 받는 사람의 Apple ID 로). 그 도구들이 앱 그룹을 알아보도록
# 권한(entitlements)만 임시 서명으로 실어 둔다.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
[ -d MateToday.xcodeproj ] || xcodegen generate

set +e
xcodebuild -project MateToday.xcodeproj -scheme MateToday -configuration Release \
  -sdk iphoneos -destination 'generic/platform=iOS' -derivedDataPath build/device \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" \
  build > out/device.log 2>&1
code=$?
set -e
grep -E "error:|warning:|BUILD (SUCCEEDED|FAILED)" out/device.log | sort -u | head -150 > out/device-errors.txt || true
if [ $code -ne 0 ]; then
  cat out/device-errors.txt
  exit $code
fi

APP=build/device/Build/Products/Release-iphoneos/MateToday.app
codesign --force --sign - --entitlements Widget/MateTodayWidget.entitlements "$APP/PlugIns/MateTodayWidget.appex"
codesign --force --sign - --entitlements App/MateToday.entitlements "$APP"

rm -rf build/ipa out/MATE-Today.ipa
mkdir -p build/ipa/Payload
cp -R "$APP" build/ipa/Payload/
(cd build/ipa && zip -qry ../../out/MATE-Today.ipa Payload)

{
  echo "version=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP/Info.plist") build=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$APP/Info.plist")"
  echo "size=$(stat -f%z out/MATE-Today.ipa) sha256=$(shasum -a 256 out/MATE-Today.ipa | cut -d' ' -f1)"
  echo "--- app entitlements"
  codesign -d --entitlements - "$APP" 2>/dev/null | grep -A3 application-groups || true
  echo "--- widget entitlements"
  codesign -d --entitlements - "$APP/PlugIns/MateTodayWidget.appex" 2>/dev/null | grep -A3 application-groups || true
  echo "--- files"
  (cd build/ipa && find Payload -maxdepth 4 | sort)
} > out/ipa-info.txt
cat out/ipa-info.txt
