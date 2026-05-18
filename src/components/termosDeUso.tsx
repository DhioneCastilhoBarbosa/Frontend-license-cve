import termosDeUsoContent from "../content/termosDeUsoContent.json"

type BlockType = "title" | "heading" | "section" | "subsection" | "paragraph" | "list"

interface ContentBlock {
  type: BlockType
  text: string
}

const blocks = termosDeUsoContent as ContentBlock[]

const blockClassName: Record<BlockType, string> = {
  title: "text-3xl font-bold text-center mb-8",
  heading: "text-sm font-semibold uppercase tracking-wide mt-8 mb-3",
  section: "text-xl font-bold mt-10 mb-3",
  subsection: "text-base mt-4 mb-2",
  paragraph: "text-base leading-relaxed mb-3 text-justify",
  list: "text-base leading-relaxed mb-2",
}

function TextWithLinks({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)

  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={index}
            href={part.replace(/[.,;]+$/, "")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-500 hover:underline break-all"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  )
}

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-zinc-900 dark:text-white overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <article className="pb-16">
          {blocks.map((block, index) => {
            const className = blockClassName[block.type]

            if (block.type === "title") {
              return (
                <h1 key={index} className={className}>
                  {block.text}
                </h1>
              )
            }

            if (block.type === "section") {
              return (
                <h2 key={index} className={className}>
                  {block.text}
                </h2>
              )
            }

            if (block.type === "heading") {
              return (
                <h3 key={index} className={className}>
                  {block.text}
                </h3>
              )
            }

            if (block.type === "list") {
              return (
                <ul key={index} className="list-disc ml-6 mb-2">
                  <li className={className}>
                    <TextWithLinks text={block.text} />
                  </li>
                </ul>
              )
            }

            return (
              <p key={index} className={className}>
                <TextWithLinks text={block.text} />
              </p>
            )
          })}
        </article>
      </div>
    </div>
  )
}