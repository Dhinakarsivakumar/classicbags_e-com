$ErrorActionPreference = "Stop"
$buildTools = "C:\android-sdk\build-tools\34.0.0"
$platformJar = "C:\android-sdk\platforms\android-34\android.jar"
$workDir = "d:\classic bags offical\android-service\apk-build"

Set-Location $workDir

Write-Host "1. Cleaning and preparing directories..."
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue gen, bin, obj, compiled_res.zip, app-base.apk, app-aligned.apk, ClassicBagsListener.apk
New-Item -ItemType Directory -Force gen | Out-Null
New-Item -ItemType Directory -Force bin | Out-Null

Write-Host "2. Compiling resources with aapt2..."
& "$buildTools\aapt2.exe" compile --dir res -o compiled_res.zip
if ($LASTEXITCODE -ne 0) { throw "aapt2 compile failed" }

Write-Host "3. Linking resources with aapt2..."
& "$buildTools\aapt2.exe" link -I $platformJar --manifest AndroidManifest.xml compiled_res.zip -o app-base.apk --java gen
if ($LASTEXITCODE -ne 0) { throw "aapt2 link failed" }

Write-Host "4. Compiling Java sources with javac..."
$javaFiles = Get-ChildItem -Recurse -Include *.java src, gen | ForEach-Object { $_.FullName }
javac -source 1.8 -target 1.8 -cp "$platformJar" -d bin $javaFiles
if ($LASTEXITCODE -ne 0) { throw "javac failed" }

Write-Host "5. Generating classes.dex with d8 (using relative paths)..."
Push-Location bin
$relClassFiles = Get-ChildItem -Recurse -Filter *.class | ForEach-Object {
    $_.FullName.Substring((Get-Location).Path.Length + 1)
}
& "$buildTools\d8.bat" --output . --lib "$platformJar" $relClassFiles
$d8Exit = $LASTEXITCODE
Pop-Location
if ($d8Exit -ne 0) { throw "d8 failed" }

Write-Host "6. Adding classes.dex to APK package..."
jar uf app-base.apk -C bin classes.dex
if ($LASTEXITCODE -ne 0) { throw "jar package failed" }

Write-Host "7. Aligning APK with zipalign..."
& "$buildTools\zipalign.exe" -f -p 4 app-base.apk app-aligned.apk
if ($LASTEXITCODE -ne 0) { throw "zipalign failed" }

Write-Host "8. Checking or generating debug keystore..."
if (-not (Test-Path "debug.keystore")) {
    keytool -genkeypair -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=ClassicBags, OU=Mobile, O=ClassicBags, L=Thanjavur, ST=TN, C=IN"
}

Write-Host "9. Signing APK with apksigner..."
& "$buildTools\apksigner.bat" sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android --out "..\ClassicBagsListener.apk" app-aligned.apk
if ($LASTEXITCODE -ne 0) { throw "apksigner failed" }

Write-Host "SUCCESS! APK generated at d:\classic bags offical\android-service\ClassicBagsListener.apk"
Get-Item "..\ClassicBagsListener.apk" | Select-Object Name, Length, LastWriteTime
