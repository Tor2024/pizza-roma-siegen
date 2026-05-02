// In-memory menu storage - works without GitHub
import menuData from '@/public/data/menu.json';
import { MenuData } from '@/types';

let currentMenuData: MenuData = JSON.parse(JSON.stringify(menuData));

export function getMenu(): MenuData {
  return currentMenuData;
}

export function updateMenu(newMenuData: MenuData): boolean {
  currentMenuData = newMenuData;
  return true;
}
