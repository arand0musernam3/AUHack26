#set page(
  paper: "presentation-16-9",
  background: {
    // Full-screen background image
    image(
      "./map-blurred.jpeg",
      width: 100%,
      height: 100%,
      fit: "cover",
    scaling: "pixelated"
    )
    
    // Dark overlay for readability (adjust alpha for opacity)
    place(
      top + left,
      rect(
        //fill: rgba(10, 12, 15, 0.55),  // ← tweak the last value (0–1)
        fill: rgb("#10121509"),
        width: 100%,
        height: 100%,
      )
    )
  },
  margin: 2em,
)

#set text(
  font: "JetBrainsMono Nerd Font",
  fill: rgb("#e0e6ed"),
)

#align(center + horizon)[
  // Semi-transparent backdrop behind the text block
  #block(
    fill: rgb("#000000b5"),
    inset: (x: 1.5em, y: 1em),
    radius: 0.4em,
  )[
    #text(
      size: 4.5em,
      weight: 800,
      tracking: 0.15em,
    )[ENERGY MARKET]
    
    #v(0.5em)
    
    #text(
      size: 1.2em,
      fill: rgb("#00e5ff"),
      tracking: 0.3em,
      weight: 500,
    )[Fun Skibidi Trading for non traders]
  ]
]
