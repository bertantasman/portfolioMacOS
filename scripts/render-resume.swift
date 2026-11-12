// Renders the résumé JSON from scripts/resume-data.ts to an A4 PDF with selectable text (macOS only):
//   swift scripts/render-resume.swift resume.json public/documents/Resume.pdf
import AppKit
import CoreText

struct Resume: Decodable {
  struct Experience: Decodable { let org: String; let role: String; let dates: String?; let location: String?; let bullets: [String] }
  struct Education: Decodable { let institution: String; let degree: String; let dates: String?; let location: String?; let note: String? }
  struct Project: Decodable { let name: String; let status: String?; let text: String; let url: String? }
  struct Skill: Decodable { let name: String; let items: String }
  let name: String; let headline: String?; let contact: [String]; let summary: String?
  let experience: [Experience]; let education: [Education]; let projects: [Project]; let skills: [Skill]; let languages: [String]
}

let args = CommandLine.arguments
let resume = try! JSONDecoder().decode(Resume.self, from: Data(contentsOf: URL(fileURLWithPath: args[1])))

let ink = NSColor(calibratedWhite: 0.12, alpha: 1)
let muted = NSColor(calibratedWhite: 0.42, alpha: 1)
let accent = NSColor(calibratedRed: 0.0, green: 0.38, blue: 0.85, alpha: 1)

func font(_ size: CGFloat, bold: Bool = false) -> NSFont { NSFont(name: bold ? "HelveticaNeue-Bold" : "HelveticaNeue", size: size)! }
func style(before: CGFloat = 0, after: CGFloat = 0, indent: CGFloat = 0, line: CGFloat = 0) -> NSParagraphStyle {
  let p = NSMutableParagraphStyle()
  p.paragraphSpacingBefore = before; p.paragraphSpacing = after
  p.firstLineHeadIndent = 0; p.headIndent = indent; p.lineSpacing = line
  return p
}

// The résumé is built as chunks; each chunk starts on a new page, so a heading is never left alone at a page bottom.
var chunks = [NSMutableAttributedString()]
func newPage() { chunks.append(NSMutableAttributedString()) }
func add(_ text: String, size: CGFloat = 9.5, bold: Bool = false, color: NSColor = ink, before: CGFloat = 0, after: CGFloat = 0, indent: CGFloat = 0, kern: CGFloat = 0, link: String? = nil) {
  var attrs: [NSAttributedString.Key: Any] = [.font: font(size, bold: bold), .foregroundColor: color, .paragraphStyle: style(before: before, after: after, indent: indent, line: 1.5), .kern: kern]
  if let link { attrs[.link] = URL(string: link) }
  chunks[chunks.count - 1].append(NSAttributedString(string: text + "\n", attributes: attrs))
}
func heading(_ t: String) { add(t.uppercased(), size: 9.5, bold: true, color: accent, before: 14, after: 3, kern: 1.2) }

add(resume.name, size: 24, bold: true, after: 0)
if let h = resume.headline { add(h, size: 12, color: muted, after: 2) }
add(resume.contact.prefix(2).joined(separator: "   ·   "), size: 9, color: muted)
add(resume.contact.dropFirst(2).joined(separator: "   ·   "), size: 9, color: muted, after: 4)
if let s = resume.summary { heading("Summary"); add(s, after: 2) }

heading("Experience")
for e in resume.experience {
  add(e.org, size: 11, bold: true, before: 5)
  add([e.role, e.dates, e.location].compactMap { $0 }.joined(separator: "  ·  "), size: 9.5, color: muted, after: 2)
  for b in e.bullets { add("•  " + b, indent: 11) }
}

heading("Education")
for e in resume.education {
  add(e.institution, size: 11, bold: true, before: 5)
  add([e.degree, e.dates, e.location].compactMap { $0 }.joined(separator: "  ·  "), color: muted, after: 1)
  if let n = e.note { add(n) }
}

newPage()
heading("Selected projects")
for p in resume.projects {
  add(p.name + (p.status.map { "  —  \($0)" } ?? ""), size: 10.5, bold: true, before: 5)
  add(p.text)
  if let u = p.url { add(u, size: 9, color: accent, link: u) }
}

heading("Skills")
for s in resume.skills { add("\(s.name): \(s.items)", before: 1) }
heading("Languages")
add(resume.languages.joined(separator: "   ·   "))

// Paginate with Core Text into A4 pages.
let page = CGRect(x: 0, y: 0, width: 595, height: 842)
let margin: CGFloat = 46
let box = page.insetBy(dx: margin, dy: margin)
var mediaBox = page
let ctx = CGContext(URL.init(fileURLWithPath: args[2]) as CFURL, mediaBox: &mediaBox, [kCGPDFContextTitle: "\(resume.name) — Résumé", kCGPDFContextAuthor: resume.name] as CFDictionary)!
for doc in chunks {
let setter = CTFramesetterCreateWithAttributedString(doc)
var location = 0
while location < doc.length {
  ctx.beginPDFPage(nil)
  let path = CGPath(rect: box, transform: nil)
  let frame = CTFramesetterCreateFrame(setter, CFRange(location: location, length: 0), path, nil)
  CTFrameDraw(frame, ctx)
  // Make links clickable.
  let lines = CTFrameGetLines(frame) as! [CTLine]
  var origins = [CGPoint](repeating: .zero, count: lines.count)
  CTFrameGetLineOrigins(frame, CFRange(location: 0, length: 0), &origins)
  for (i, line) in lines.enumerated() {
    let range = CTLineGetStringRange(line)
    doc.enumerateAttribute(.link, in: NSRange(location: range.location, length: range.length)) { value, r, _ in
      guard let url = value as? URL else { return }
      let x0 = CTLineGetOffsetForStringIndex(line, r.location, nil), x1 = CTLineGetOffsetForStringIndex(line, r.location + r.length, nil)
      var asc: CGFloat = 0, desc: CGFloat = 0, lead: CGFloat = 0
      _ = CTLineGetTypographicBounds(line, &asc, &desc, &lead)
      let rect = CGRect(x: box.minX + origins[i].x + x0, y: box.minY + origins[i].y - desc, width: x1 - x0, height: asc + desc)
      ctx.setURL(url as CFURL, for: rect)
    }
  }
  ctx.endPDFPage()
  let visible = CTFrameGetVisibleStringRange(frame)
  if visible.length == 0 { break }
  location += visible.length
}
}
ctx.closePDF()
print("wrote", args[2])
