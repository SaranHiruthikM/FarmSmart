export function processVoiceCommand(text) {
  if (!text) return "UNKNOWN";

  const cmd = text.toLowerCase();

  const price = ["check price", "price", "prices", "market price"];
  if (price.some((x) => cmd.includes(x))) return "PRICE";

  const list = ["list crop", "add crop", "listing", "show listings"];
  if (list.some((x) => cmd.includes(x))) return "LISTING";

  const search = ["search", "find"];
  if (search.some((x) => cmd.includes(x))) return "SEARCH";

  const help = ["help", "commands", "support"];
  if (help.some((x) => cmd.includes(x))) return "HELP";

  if (cmd.includes("back")) return "VOICE";

  return "UNKNOWN";
}
