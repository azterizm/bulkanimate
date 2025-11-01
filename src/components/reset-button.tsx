import { animated as a, useSpring } from "@react-spring/web"
import { useEffect } from "react"

export default function ResetButton(props: {
  onClick: () => void
  hide? :boolean
}) {

  const [springs, api] = useSpring(() => ({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 1200
  }))

  useEffect(() => {
    if (props.hide) api.start({ opacity: 0 })
    else api.start({ opacity: 1 })
  }, [props.hide])


  return (
    <a.button
      style={springs}
      onClick={props.onClick} className="absolute top-4 right-4 text-primary">
      Reset
    </a.button>
  )
}
