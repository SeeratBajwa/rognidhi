$uri = "http://localhost:5000/ai-summary/jasnoor@test.com"
$body = @{
    doctorEmail = "dr@test.com"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $uri -Method Post -Body $body -ContentType "application/json"
$response.Content
