; 老朱应用商店 - Inno Setup 安装脚本
; 编译：ISCC.exe setup.iss
; 产物：dist_installer\老朱应用商店_Setup_v1.0.exe

#define AppName "老朱应用商店"
#define AppVersion "1.0"
#define AppPublisher "老朱"
#define AppExe "老朱应用商店.exe"

[Setup]
; AppId 一旦发布就不能改，否则升级会变成"装两份"
AppId={{9C1F7A62-3B4D-4E58-9A21-6D0B5C8E4F13}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
VersionInfoCompany={#AppPublisher}
VersionInfoDescription={#AppName} 安装程序
VersionInfoProductName={#AppName}
VersionInfoProductVersion=1.0.0.0
VersionInfoVersion=1.0.0.0
VersionInfoTextVersion=1.0.0.0
VersionInfoProductTextVersion=1.0.0.0
VersionInfoCopyright=Copyright © 2026 老朱
VersionInfoOriginalFileName=老朱应用商店_Setup_v1.0.exe

; 默认装到 D 盘；D 盘不是固定磁盘时由 [Code] 退回系统程序目录，用户仍可在向导里改
DefaultDirName={code:GetDefaultDir}
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
UsePreviousAppDir=yes

; 装进 Program Files 必须提权
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0

OutputDir=dist_installer
OutputBaseFilename=老朱应用商店_Setup_v1.0
SetupIconFile=assets\img\icon.ico
UninstallDisplayIcon={app}\{#AppExe}
UninstallDisplayName={#AppName} {#AppVersion}

Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
AllowNoIcons=yes
DisableWelcomePage=no
CloseApplications=yes
RestartApplications=no
; 卸载后连同配置目录一起清掉，不留残留
Uninstallable=yes

[Languages]
Name: "chs"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[Files]
Source: "dist\老朱应用商店.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion
; 微软官方 WebView2 引导安装器：目标机缺运行库时由 PrepareToInstall 静默安装
Source: "build\redist\MicrosoftEdgeWebview2Setup.exe"; DestDir: "{tmp}"; Flags: dontcopy

[Icons]
; 开始菜单文件夹：老朱应用商店
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExe}"; WorkingDir: "{app}"
Name: "{group}\卸载 {#AppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExe}"; WorkingDir: "{app}"

[Run]
Filename: "{app}\{#AppExe}"; Description: "立即运行 {#AppName}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; 安装目录整棵清掉（含运行时可能落下的日志/缓存）
Type: filesandordirs; Name: "{app}"
; 配置（%APPDATA%）与 WebView2 缓存、日志（%LOCALAPPDATA%）
Type: filesandordirs; Name: "{userappdata}\{#AppName}"
Type: filesandordirs; Name: "{localappdata}\{#AppName}"

[Code]
const
  DRIVE_FIXED = 3;
  WEBVIEW2_CLIENT = '{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}';

function GetDriveTypeW(RootPathName: String): Cardinal;
  external 'GetDriveTypeW@kernel32.dll stdcall';
function FindWindowW(lpClassName, lpWindowName: String): THandle;
  external 'FindWindowW@user32.dll stdcall';

{ 默认目录：D 盘可用就用要求的路径，否则退回系统程序目录 }
function GetDefaultDir(Param: String): String;
begin
  if GetDriveTypeW('D:\') = DRIVE_FIXED then
    Result := 'D:\Program Files\老朱应用商店'
  else
    Result := ExpandConstant('{autopf}\老朱应用商店');
end;

{ WebView2 运行时：pywebview 靠它渲染。三个注册表视图任一有 pv 即视为已装 }
function IsWebView2Installed(): Boolean;
var
  Ver: String;
begin
  Result :=
    RegQueryStringValue(HKLM, 'SOFTWARE\Microsoft\EdgeUpdate\Clients\' + WEBVIEW2_CLIENT, 'pv', Ver) or
    RegQueryStringValue(HKLM, 'SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\' + WEBVIEW2_CLIENT, 'pv', Ver) or
    RegQueryStringValue(HKCU, 'SOFTWARE\Microsoft\EdgeUpdate\Clients\' + WEBVIEW2_CLIENT, 'pv', Ver);
end;

{ 复制文件之前先把运行库补齐，否则程序起来是白屏 }
function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  R: Integer;
  Boot: String;
begin
  Result := '';
  if IsWebView2Installed() then
    Exit;
  ExtractTemporaryFile('MicrosoftEdgeWebview2Setup.exe');
  Boot := ExpandConstant('{tmp}\MicrosoftEdgeWebview2Setup.exe');
  if not FileExists(Boot) then
  begin
    Result := '缺少 WebView2 运行库安装文件，无法继续。';
    Exit;
  end;
  if (not Exec(Boot, '/silent /install', '', SW_HIDE, ewWaitUntilTerminated, R)) or (R <> 0) then
    Result := '安装 WebView2 运行库失败（退出码 ' + IntToStr(R) + '）。' + #13#10 +
              '请确认能上网后重试，或先手动安装微软 WebView2 运行时。';
end;

function IsAppRunning(): Boolean;
begin
  Result := FindWindowW('', '老朱应用商店') <> 0;
end;

{ 卸载前结束正在运行的实例，否则 exe 被占用删不掉，会留下残骸 }
procedure KillApp();
var
  R: Integer;
begin
  Exec('taskkill.exe', '/F /IM "{#AppExe}"', '', SW_HIDE, ewWaitUntilTerminated, R);
end;

function InitializeUninstall(): Boolean;
begin
  Result := True;
  if IsAppRunning() then
  begin
    if MsgBox('{#AppName} 正在运行，卸载前需要先关闭它。' + #13#10 +
              '是否立即关闭并继续卸载？', mbConfirmation, MB_YESNO) = IDYES then
      KillApp()
    else
      Result := False;
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  R: Integer;
  AppDir: String;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    KillApp();
    AppDir := ExpandConstant('{app}');
    if DirExists(AppDir) then
    begin
      { 刚装完就卸载、或杀软正在扫描 exe 时，文件句柄没释放，卸载器删不掉主程序，
        会留一个空壳目录。等 1.5 秒让句柄失效再删一遍。 }
      Sleep(1500);
      Exec('cmd.exe', '/c rd /s /q "' + AppDir + '"', '', SW_HIDE, ewWaitUntilTerminated, R);
      if DirExists(AppDir) then
        DelTree(AppDir, True, True, True);
    end;
  end;
end;
