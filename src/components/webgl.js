let supportResult;

export function supportsWebGL() {
  if (supportResult !== undefined) return supportResult;
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    supportResult = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return supportResult;
  } catch {
    supportResult = false;
    return supportResult;
  }
}
