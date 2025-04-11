export default class CategoryUtils {
  public static getFriendlyName(category: string) {
    return category
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
