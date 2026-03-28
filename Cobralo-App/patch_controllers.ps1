$controllers = Get-ChildItem -Path "backend\src\controllers\*.ts"
foreach ($file in $controllers) {
    echo "Patching $($file.FullName)"
    $content = Get-Content $file.FullName
    $newContent = $content -replace 'id: parseInt\(id\)', 'id: parseInt(id as any)' `
                           -replace 'id: parseInt\(id, 10\)', 'id: parseInt(id as any, 10)' `
                           -replace 'parseInt\(studentId\)', 'parseInt(studentId as any)' `
                           -replace 'Number\(year\)', 'Number(year as any)' `
                           -replace 'Number\(month\)', 'Number(month as any)' `
                           -replace 'Number\(studentId\)', 'Number(studentId as any)'
    $newContent | Set-Content $file.FullName
}
