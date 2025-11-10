use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct SerperUsageResponse {
    // Actual Serper API fields
    balance: Option<i32>,
    #[serde(alias = "rateLimit")]
    rate_limit: Option<i32>,
    // Legacy/alternative field names
    #[serde(alias = "creditsUsed", alias = "credits_used")]
    credits_used: Option<i32>,
    #[serde(alias = "creditsRemaining", alias = "credits_remaining")]
    credits_remaining: Option<i32>,
    #[serde(alias = "creditsLimit", alias = "credits_limit")]
    credits_limit: Option<i32>,
    plan: Option<String>,
}

#[derive(Debug, Serialize)]
struct SerperUsageResult {
    success: bool,
    credits_used: i32,
    credits_remaining: i32,
    credits_limit: i32,
    plan: String,
    error: Option<String>,
    raw_response: Option<String>,
}

#[tauri::command]
async fn get_serper_usage(api_key: String) -> Result<SerperUsageResult, String> {
    let client = reqwest::Client::new();
    
    let response = client
        .get("https://google.serper.dev/account")
        .header("X-API-KEY", api_key)
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| format!("Failed to connect to Serper API: {}", e))?;

    if !response.status().is_success() {
        return Ok(SerperUsageResult {
            success: false,
            credits_used: 0,
            credits_remaining: 0,
            credits_limit: 0,
            plan: "Unknown".to_string(),
            error: Some(format!("API returned status: {}", response.status())),
            raw_response: None,
        });
    }

    // Get raw text first for debugging
    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    // Try to parse the response
    let usage: SerperUsageResponse = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse response: {}. Raw: {}", e, response_text))?;

    // Serper API returns "balance" (remaining credits) and "rateLimit" (requests per second)
    // We need to calculate used credits if we have a limit
    let balance = usage.balance.unwrap_or(0);
    let rate_limit = usage.rate_limit.unwrap_or(0);
    
    // For free tier: 2500 credits/month
    // Determine plan and limit based on balance
    let (plan, credits_limit) = if balance > 2500 {
        ("Pro".to_string(), 10000) // Assume Pro plan
    } else if balance > 0 {
        ("Free".to_string(), 2500) // Free tier
    } else {
        ("Unknown".to_string(), 0)
    };
    
    let credits_used = if credits_limit > 0 {
        credits_limit - balance
    } else {
        0
    };

    Ok(SerperUsageResult {
        success: true,
        credits_used,
        credits_remaining: balance,
        credits_limit,
        plan,
        error: None,
        raw_response: Some(response_text),
    })
}

#[tauri::command]
fn minimize_window(window: tauri::Window) {
  window.minimize().unwrap();
}

#[tauri::command]
fn maximize_window(window: tauri::Window) {
  window.maximize().unwrap();
}

#[tauri::command]
fn unmaximize_window(window: tauri::Window) {
  window.unmaximize().unwrap();
}

#[tauri::command]
fn close_window(window: tauri::Window) {
  window.close().unwrap();
}

#[tauri::command]
fn is_maximized(window: tauri::Window) -> bool {
  window.is_maximized().unwrap()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_http::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      get_serper_usage,
      minimize_window,
      maximize_window,
      unmaximize_window,
      close_window,
      is_maximized
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
