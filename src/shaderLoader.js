export async function loadShader(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return text;
  } catch (error) {
    console.error(`Failed to load shader: ${path}`, error);
    throw error;
  }
}
