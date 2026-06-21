/** Encode path segments for assets under public/arsenal (spaces, etc.). */
export function arsenalPath(...segments: string[]) {
  return `/arsenal/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`
}

export function multiviewPaths(folder: string, count = 4) {
  return Array.from({ length: count }, (_, index) =>
    arsenalPath('art', folder, `multiview_${index}-Photoroom.png`)
  )
}
