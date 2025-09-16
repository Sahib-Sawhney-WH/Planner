// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    Manager,
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Create app menu
            let app_menu = Submenu::new(
                app,
                "File",
                Menu::with_items(app, &[
                    &MenuItem::with_id(app, "backup", "Backup Data", true, Some("Ctrl+B"))?,
                    &MenuItem::with_id(app, "export", "Export...", true, Some("Ctrl+E"))?,
                    &MenuItem::with_id(app, "import", "Import...", true, Some("Ctrl+I"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::quit(app, None)?,
                ])?,
            )?;

            let edit_menu = Submenu::new(
                app,
                "Edit",
                Menu::with_items(app, &[
                    &PredefinedMenuItem::undo(app, None)?,
                    &PredefinedMenuItem::redo(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, None)?,
                    &PredefinedMenuItem::copy(app, None)?,
                    &PredefinedMenuItem::paste(app, None)?,
                    &PredefinedMenuItem::select_all(app, None)?,
                ])?,
            )?;

            let view_menu = Submenu::new(
                app,
                "View",
                Menu::with_items(app, &[
                    &MenuItem::with_id(app, "tasks", "Tasks", true, Some("Ctrl+1"))?,
                    &MenuItem::with_id(app, "projects", "Projects", true, Some("Ctrl+2"))?,
                    &MenuItem::with_id(app, "clients", "Clients", true, Some("Ctrl+3"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, "presenter", "Presenter Mode", true, Some("Ctrl+Shift+P"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::fullscreen(app, None)?,
                ])?,
            )?;

            let tools_menu = Submenu::new(
                app,
                "Tools",
                Menu::with_items(app, &[
                    &MenuItem::with_id(app, "timer", "Start Timer", true, Some("Ctrl+T"))?,
                    &MenuItem::with_id(app, "capture", "Quick Capture", true, Some("Ctrl+Shift+N"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, "review", "Weekly Review", true, Some("Ctrl+R"))?,
                    &MenuItem::with_id(app, "settings", "Settings", true, Some("Ctrl+,"))?,
                ])?,
            )?;

            let menu = Menu::with_items(app, &[
                &app_menu,
                &edit_menu,
                &view_menu,
                &tools_menu,
            ])?;

            app.set_menu(menu)?;

            // Create system tray
            let tray_menu = Menu::with_items(app, &[
                &MenuItem::with_id(app, "show", "Show", true, None)?,
                &MenuItem::with_id(app, "hide", "Hide", true, None)?,
                &PredefinedMenuItem::separator(app)?,
                &MenuItem::with_id(app, "quit_tray", "Quit", true, None)?,
            ])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&tray_menu)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        },
                        "hide" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.hide();
                            }
                        },
                        "quit_tray" => {
                            app.exit(0);
                        },
                        _ => {}
                    }
                })
                .on_tray_icon_event(|app, event| {
                    match event {
                        TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        },
                        _ => {}
                    }
                })
                .build(app)?;

            // Handle menu events
            app.on_menu_event(|app, event| {
                match event.id.as_ref() {
                    "backup" => {
                        println!("Backup triggered");
                    },
                    "export" => {
                        println!("Export triggered");
                    },
                    "import" => {
                        println!("Import triggered");
                    },
                    "tasks" | "projects" | "clients" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("navigate", event.id.as_ref());
                        }
                    },
                    "presenter" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("toggle-presenter", ());
                        }
                    },
                    "timer" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("start-timer", ());
                        }
                    },
                    "capture" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("quick-capture", ());
                        }
                    },
                    "review" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("weekly-review", ());
                        }
                    },
                    "settings" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("open-settings", ());
                        }
                    },
                    _ => {}
                }
            });

            // Handle window close event - hide to tray instead of closing
            if let Some(window) = app.get_webview_window("main") {
                window.on_window_event(|event| {
                    match event {
                        tauri::WindowEvent::CloseRequested { api, .. } => {
                            api.prevent_close();
                            let _ = event.window().hide();
                        },
                        _ => {}
                    }
                });
            }

            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}