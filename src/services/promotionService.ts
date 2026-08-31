import seedPromotionsJson from '../seed/seedPromotions.json';
import { 
  VisualPresetDto, 
  ConsoleMenuDto, 
  PromotionRequestDto, 
  PromotionResponseDto, 
  PromotionMapper 
} from '../dtos/PromotionDto';
import { STORAGE_KEYS } from '../constants/storageKeys';

const PRESETS_STORAGE_KEY = STORAGE_KEYS.PROMO_PRESETS;
const MENUS_STORAGE_KEY = STORAGE_KEYS.POS_CONSOLE_MENUS;
const PROMOS_STORAGE_KEY = STORAGE_KEYS.PROMOTIONS_LIST;

export class PromotionService {
  /**
   * Get visual presets
   */
  public getVisualPresets(): VisualPresetDto[] {
    try {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached presets', e);
    }
    const presets = seedPromotionsJson.visualPresets;
    this.saveVisualPresets(presets);
    return presets;
  }

  public saveVisualPresets(presets: VisualPresetDto[]): void {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  }

  /**
   * Get console menus
   */
  public getConsoleMenus(): ConsoleMenuDto[] {
    try {
      const saved = localStorage.getItem(MENUS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached console menus', e);
    }
    const menus = seedPromotionsJson.consoleMenus as ConsoleMenuDto[];
    this.saveConsoleMenus(menus);
    return menus;
  }

  public saveConsoleMenus(menus: ConsoleMenuDto[]): void {
    localStorage.setItem(MENUS_STORAGE_KEY, JSON.stringify(menus));
  }

  /**
   * Get promotions list
   */
  public getPromotions(): PromotionResponseDto[] {
    try {
      const saved = localStorage.getItem(PROMOS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => PromotionMapper.toResponseDto(item, idx));
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached promotions', e);
    }

    const list = seedPromotionsJson.promotionsList.map((item, idx) => PromotionMapper.toResponseDto(item, idx));
    this.savePromotions(list);
    return list;
  }

  public savePromotions(promotions: PromotionResponseDto[]): void {
    localStorage.setItem(PROMOS_STORAGE_KEY, JSON.stringify(promotions));
  }

  public createPromotion(dto: PromotionRequestDto): PromotionResponseDto {
    const list = this.getPromotions();
    const newPromo = PromotionMapper.fromRequestDto(dto);
    const updated = [newPromo, ...list];
    this.savePromotions(updated);
    return newPromo;
  }

  public deletePromotion(key: string): boolean {
    const list = this.getPromotions();
    const filtered = list.filter(p => p.key !== key && p.code !== key);
    if (filtered.length !== list.length) {
      this.savePromotions(filtered);
      return true;
    }
    return false;
  }

  public resetToSeed(): void {
    localStorage.removeItem(PRESETS_STORAGE_KEY);
    localStorage.removeItem(MENUS_STORAGE_KEY);
    localStorage.removeItem(PROMOS_STORAGE_KEY);
  }
}

export const promotionService = new PromotionService();
