import roosterLogo from '../imports/gallerapp-rooster-logo.png'

export function RoosterLogo({ size = 36 }: { size?: number }) {
  return (
    <img
      src={roosterLogo}
      width={size}
      height={size}
      alt="Logo de GallerApp"
      className="shrink-0 object-contain"
      draggable={false}
    />
  )
}
