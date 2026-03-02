export function getHeaderHeight(): number {
  const header = document.querySelector("header");
  if (!header) return 0;
  return header.getBoundingClientRect().height;
}

export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  const headerOffset = getHeaderHeight() + 16;
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}
