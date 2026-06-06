$ErrorActionPreference = "SilentlyContinue"

$baseUrl = "http://localhost:8080"
$results = @()

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$Token,
        [hashtable]$Body = $null
    )
    
    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = "$baseUrl$Uri"
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json)
        $params["ContentType"] = "application/json"
    }
    
    try {
        $response = Invoke-WebRequest @params
        $statusCode = [int]$response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        } else {
            $statusCode = "Error: $($_.Exception.Message)"
        }
    }
    
    $results += [PSCustomObject]@{
        Method = $Method
        Endpoint = $Uri
        StatusCode = $statusCode
    }
    Write-Host "Tested $Method $Uri -> $statusCode"
}

# 1. Register User
Write-Host "Registering user..."
$registerBody = @{
    email = "test@example.com"
    password = "Password123!"
    fullName = "Test User"
    role = "ADMIN"
}
Test-Endpoint -Method "POST" -Uri "/api/v1/auth/register" -Body $registerBody

# 2. Login User
Write-Host "Logging in..."
$loginBody = @{
    email = "test@example.com"
    password = "Password123!"
}
$token = ""
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method "POST" -Body ($loginBody | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.accessToken
    Write-Host "Login successful. Token obtained."
} catch {
    Write-Host "Login failed: $_"
}

# Approvals
Test-Endpoint -Method "POST" -Uri "/api/v1/approvals" -Token $token -Body @{}
Test-Endpoint -Method "GET" -Uri "/api/v1/approvals/for-me" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/approvals/by-me" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/approvals/1" -Token $token
Test-Endpoint -Method "POST" -Uri "/api/v1/approvals/1/process" -Token $token -Body @{}

# Audit
Test-Endpoint -Method "GET" -Uri "/api/v1/audit" -Token $token

# Invoices
Test-Endpoint -Method "POST" -Uri "/api/v1/invoices" -Token $token -Body @{}
Test-Endpoint -Method "GET" -Uri "/api/v1/invoices" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/invoices/1" -Token $token
Test-Endpoint -Method "PATCH" -Uri "/api/v1/invoices/1/status" -Token $token -Body @{}
Test-Endpoint -Method "POST" -Uri "/api/v1/invoices/1/send" -Token $token -Body @{}
Test-Endpoint -Method "GET" -Uri "/api/v1/invoices/1/pdf" -Token $token

# Notifications
Test-Endpoint -Method "GET" -Uri "/api/v1/notifications" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/notifications/unread-count" -Token $token
Test-Endpoint -Method "POST" -Uri "/api/v1/notifications/1/read" -Token $token -Body @{}
Test-Endpoint -Method "POST" -Uri "/api/v1/notifications/read-all" -Token $token -Body @{}

# Purchase Orders
Test-Endpoint -Method "POST" -Uri "/api/v1/purchase-orders" -Token $token -Body @{}
Test-Endpoint -Method "GET" -Uri "/api/v1/purchase-orders" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/purchase-orders/1" -Token $token
Test-Endpoint -Method "PATCH" -Uri "/api/v1/purchase-orders/1/status" -Token $token -Body @{}
Test-Endpoint -Method "POST" -Uri "/api/v1/purchase-orders/1/send" -Token $token -Body @{}
Test-Endpoint -Method "GET" -Uri "/api/v1/purchase-orders/1/pdf" -Token $token

# Quotations
Test-Endpoint -Method "POST" -Uri "/api/v1/quotations" -Token $token -Body @{}
Test-Endpoint -Method "GET" -Uri "/api/v1/quotations" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/quotations/1" -Token $token
Test-Endpoint -Method "PUT" -Uri "/api/v1/quotations/1" -Token $token -Body @{}
Test-Endpoint -Method "POST" -Uri "/api/v1/quotations/1/submit" -Token $token -Body @{}
Test-Endpoint -Method "POST" -Uri "/api/v1/quotations/1/items" -Token $token -Body @{}
Test-Endpoint -Method "PUT" -Uri "/api/v1/quotations/1/items/1" -Token $token -Body @{}
Test-Endpoint -Method "DELETE" -Uri "/api/v1/quotations/1/items/1" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/quotations/rfq/1/compare" -Token $token
Test-Endpoint -Method "POST" -Uri "/api/v1/quotations/1/select" -Token $token -Body @{}

# Reports
Test-Endpoint -Method "GET" -Uri "/api/v1/reports/dashboard" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/reports/vendor-performance" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/reports/spending-summary" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/reports/procurement-trends" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/reports/vendor-performance/export" -Token $token

# RFQs
Test-Endpoint -Method "POST" -Uri "/api/v1/rfqs" -Token $token -Body @{}
Test-Endpoint -Method "GET" -Uri "/api/v1/rfqs" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/rfqs/1" -Token $token
Test-Endpoint -Method "PUT" -Uri "/api/v1/rfqs/1" -Token $token -Body @{}
Test-Endpoint -Method "DELETE" -Uri "/api/v1/rfqs/1" -Token $token
Test-Endpoint -Method "POST" -Uri "/api/v1/rfqs/1/publish" -Token $token -Body @{}
Test-Endpoint -Method "POST" -Uri "/api/v1/rfqs/1/close" -Token $token -Body @{}
Test-Endpoint -Method "POST" -Uri "/api/v1/rfqs/1/items" -Token $token -Body @{}
Test-Endpoint -Method "PUT" -Uri "/api/v1/rfqs/1/items/1" -Token $token -Body @{}
Test-Endpoint -Method "DELETE" -Uri "/api/v1/rfqs/1/items/1" -Token $token
Test-Endpoint -Method "POST" -Uri "/api/v1/rfqs/1/attachments" -Token $token -Body @{}
Test-Endpoint -Method "DELETE" -Uri "/api/v1/rfqs/1/attachments/1" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/rfqs/1/attachments/1/download" -Token $token
Test-Endpoint -Method "POST" -Uri "/api/v1/rfqs/1/assign-vendors" -Token $token -Body @{}
Test-Endpoint -Method "GET" -Uri "/api/v1/rfqs/1/vendors" -Token $token

# Users
Test-Endpoint -Method "GET" -Uri "/api/v1/users" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/users/1" -Token $token
Test-Endpoint -Method "PUT" -Uri "/api/v1/users/1" -Token $token -Body @{}
Test-Endpoint -Method "DELETE" -Uri "/api/v1/users/1" -Token $token
Test-Endpoint -Method "PATCH" -Uri "/api/v1/users/1/toggle-active" -Token $token -Body @{}

# Vendors
Test-Endpoint -Method "POST" -Uri "/api/v1/vendors" -Token $token -Body @{}
Test-Endpoint -Method "GET" -Uri "/api/v1/vendors" -Token $token
Test-Endpoint -Method "GET" -Uri "/api/v1/vendors/1" -Token $token
Test-Endpoint -Method "PUT" -Uri "/api/v1/vendors/1" -Token $token -Body @{}
Test-Endpoint -Method "DELETE" -Uri "/api/v1/vendors/1" -Token $token
Test-Endpoint -Method "PATCH" -Uri "/api/v1/vendors/1/status" -Token $token -Body @{}

$results | ConvertTo-Json | Out-File -FilePath "verification_results.json"
Write-Host "Results saved to verification_results.json"
