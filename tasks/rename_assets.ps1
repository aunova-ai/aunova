$dir = "C:\antigravity\aunova옴니solution\page_flow_definition"
$assetDir = "$dir\asset"

Move-Item -Path "$dir\media__*.png" -Destination $assetDir -Force

$mapping = @{
    "media__1771978255938.png" = "0_Landing_Page.png";
    "media__1771891472385.png" = "1_Main_Page.png";
    "media__1772051475757.png" = "2_Synthesis_Workspace.png";
    "media__1772053185348.png" = "3_Processing_Wait_Page.png";
    "media__1772054402633.png" = "4_Result_Viewer_Export.png";
    "media__1772056976662.png" = "5_Delivery_Home.png";
    "media__1772058509747.png" = "a_Login_Page.png";
    "media__1772059920119.png" = "b_Signup_Page.png";
    "media__1772061362772.png" = "c_Deposit_Payment_Page.png";
    "media__1772061559828.png" = "d_Final_Payment_Page.png";
    "media__1771893692465.png" = "Admin_Factory_Page.png";
    "media__1771893940949.png" = "Admin_Lab_Page.png";
}

$mdPath = "$dir\page_flow_definition.md"
$content = Get-Content $mdPath -Raw

foreach ($key in $mapping.Keys) {
    if (Test-Path "$assetDir\$key") {
        Move-Item -Path "$assetDir\$key" -Destination "$dir\$($mapping[$key])" -Force
        $content = $content.Replace("./$key", "./$($mapping[$key])")
    } else {
        Write-Host "Warning: $key missing"
    }
}

$content | Set-Content $mdPath -Encoding UTF8
