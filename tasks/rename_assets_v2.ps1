$dir = "C:\antigravity\aunova옴니solution\page_flow_definition"
$assetDir = "$dir\asset"

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

# 1. Rename the 12 files IN PLACE
foreach ($key in $mapping.Keys) {
    if (Test-Path "$dir\$key") {
        Rename-Item -Path "$dir\$key" -NewName $($mapping[$key]) -Force
    }
}

# 2. Move remaining media files to asset folder
Move-Item -Path "$dir\media__*.png" -Destination $assetDir -Force

# 3. Read markdown using .NET to avoid encoding/Raw issues
$mdPath = "$dir\page_flow_definition.md"
$content = [System.IO.File]::ReadAllText($mdPath, [System.Text.Encoding]::UTF8)

# 4. Replace image paths in markdown
foreach ($key in $mapping.Keys) {
    $content = $content.Replace("./$key", "./$($mapping[$key])")
}

# 5. Write back markdown using .NET
[System.IO.File]::WriteAllText($mdPath, $content, [System.Text.Encoding]::UTF8)
