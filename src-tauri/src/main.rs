// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, SystemTray, SystemTrayMenu, SystemTrayMenuItem};
use tauri::{Manager, SystemTrayEvent};

fn main() {
    // Create system tray
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    // Create app menu
    let submenu_file = Submenu::new(
        "File",
        Menu::new()
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("backup", "Backup Data").accelerator("Ctrl+B"))
            .add_item(CustomMenuItem::new("export", "Export...").accelerator("Ctrl+E"))
            .add_item(CustomMenuItem::new("import", "Import...").accelerator("Ctrl+I"))
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    );

    let submenu_edit = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    );

    let submenu_view = Submenu::new(
        "View",
        Menu::new()
            .add_item(CustomMenuItem::new("tasks", "Tasks").accelerator("Ctrl+1"))
            .add_item(CustomMenuItem::new("projects", "Projects").accelerator("Ctrl+2"))
            .add_item(CustomMenuItem::new("clients", "Clients").accelerator("Ctrl+3"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("presenter", "Presenter Mode").accelerator("Ctrl+Shift+P"))
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::EnterFullScreen),
    );

    let submenu_tools = Submenu::new(
        "Tools",
        Menu::new()
            .add_item(CustomMenuItem::new("timer", "Start Timer").accelerator("Ctrl+T"))
            .add_item(CustomMenuItem::new("capture", "Quick Capture").accelerator("Ctrl+Shift+N"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("review", "Weekly Review").accelerator("Ctrl+R"))
            .add_item(CustomMenuItem::new("settings", "Settings").accelerator("Ctrl+,")),
    );

    let menu = Menu::new()
        .add_submenu(submenu_file)
        .add_submenu(submenu_edit)
        .add_submenu(submenu_view)
        .add_submenu(submenu_tools);

    tauri::Builder::default()
        .menu(menu)
        .system_tray(system_tray)
        .on_menu_event(|event| match event.menu_item_id() {
            "backup" => {
                // Handle backup
                println!("Backup triggered");
            }
            "export" => {
                // Handle export
                println!("Export triggered");
            }
            "import" => {
                // Handle import
                println!("Import triggered");
            }
            "tasks" | "projects" | "clients" => {
                // Navigate to view
                event.window().emit("navigate", event.menu_item_id()).unwrap();
            }
            "presenter" => {
                // Toggle presenter mode
                event.window().emit("toggle-presenter", {}).unwrap();
            }
            "timer" => {
                // Start timer
                event.window().emit("start-timer", {}).unwrap();
            }
            "capture" => {
                // Quick capture
                event.window().emit("quick-capture", {}).unwrap();
            }
            "review" => {
                // Weekly review
                event.window().emit("weekly-review", {}).unwrap();
            }
            "settings" => {
                // Open settings
                event.window().emit("open-settings", {}).unwrap();
            }
            _ => {}
        })
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                // Hide to tray instead of closing
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}