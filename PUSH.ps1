$ErrorActionPreference = 'Stop'
$remote = 'https://github.com/Navid-Ishaq/readiq-detleng.git'
function Git-Run {
    & git @args
    if ($LASTEXITCODE -ne 0) { throw 'Git command failed. Nothing force-pushed.' }
}
Push-Location -LiteralPath $PSScriptRoot
try {
    if (!(Test-Path -LiteralPath 'Read Irfanul Quran' -PathType Container)) {
        throw 'Missing Read Irfanul Quran folder. Push stopped.'
    }
    Get-ChildItem -LiteralPath 'Read Irfanul Quran' -Directory -Recurse | ForEach-Object {
        if (@(Get-ChildItem -LiteralPath $_.FullName -Force).Count -eq 0) {
            New-Item -ItemType File -Path (Join-Path $_.FullName '.gitkeep') | Out-Null
        }
    }
    python tools/build.py
    if ($LASTEXITCODE -ne 0) { throw 'Document validation failed. Nothing pushed.' }
    if (!(Test-Path -LiteralPath '.git')) {
        Git-Run init -b main
        Git-Run remote add origin $remote
        Git-Run fetch origin main
        # Keep local files while adopting the existing repository history.
        Git-Run reset --mixed origin/main
    }
    else {
        $actualRoot = & git rev-parse --show-toplevel
        if ($LASTEXITCODE -ne 0 -or
            [IO.Path]::GetFullPath($actualRoot) -ne [IO.Path]::GetFullPath($PSScriptRoot)) {
            throw 'Unexpected Git root.'
        }
        $actualRemote = & git remote get-url origin
        if ($LASTEXITCODE -ne 0 -or $actualRemote -ne $remote) { throw 'Unexpected Git remote.' }
        $branch = & git branch --show-current
        if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') { throw 'Please use main branch.' }
        Git-Run fetch origin main
        # A remote-only edit must be reviewed; never overwrite it automatically.
        Git-Run merge-base --is-ancestor origin/main HEAD
    }
    Git-Run add --all
    & git diff --cached --quiet
    $diffCode = $LASTEXITCODE
    if ($diffCode -eq 1) {
        Git-Run commit -m ('Update Read IQ library ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
    }
    elseif ($diffCode -ne 0) { throw 'Could not check staged changes.' }
    Git-Run push origin main
    Write-Host 'Read IQ sync complete. GitHub Actions publishes new commits.' -ForegroundColor Green
}
catch {
    Write-Host $_ -ForegroundColor Red
    exit 1
}
finally { Pop-Location }
