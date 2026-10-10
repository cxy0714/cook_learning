/** 菜谱相关类型 */

export type Ingredient = {
  id: number;
  category: string;
  name: string;
  sort_order: number;
};

export type RecipeIngredient = {
  id?: number;
  ingredient_id: number | null;
  name: string;
  quantity: string;
  sort_order: number;
};

export type RecipeImage = {
  id?: number;
  url: string;
  alt: string;
  sort_order: number;
};

export type Recipe = {
  id: number;
  title: string;
  category: string;
  last_practice: string;
  steps: string; // 标准做法（markdown）
  notes: string; // 我的做法（markdown）
  ingredients: RecipeIngredient[];
  images: RecipeImage[];
  created_at: string;
  updated_at: string;
};

/** 管理表单提交的数据结构 */
export type RecipeFormData = {
  title: string;
  category: string;
  last_practice: string;
  steps: string;
  notes: string;
  ingredients: Omit<RecipeIngredient, "id">[];
  images: Omit<RecipeImage, "id">[];
};
