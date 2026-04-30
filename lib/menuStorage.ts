// In-memory menu storage - works without GitHub
import menuData from '@/public/data/menu.json';

let currentMenuData = JSON.parse(JSON.stringify(menuData));

export function getMenu() {
  return currentMenuData;
}

export function updateMenu(newMenuData: any) {
  currentMenuData = newMenuData;
  return true;
}
