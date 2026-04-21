export function wavelengthToRGB(Wavelength: number): string {
  let R, G, B;

  if (Wavelength >= 380 && Wavelength < 440) {
    R = -(Wavelength - 440) / (440 - 380);
    G = 0.0;
    B = 1.0;
  } else if (Wavelength >= 440 && Wavelength < 490) {
    R = 0.0;
    G = (Wavelength - 440) / (490 - 440);
    B = 1.0;
  } else if (Wavelength >= 490 && Wavelength < 510) {
    R = 0.0;
    G = 1.0;
    B = -(Wavelength - 510) / (510 - 490);
  } else if (Wavelength >= 510 && Wavelength < 580) {
    R = (Wavelength - 510) / (580 - 510);
    G = 1.0;
    B = 0.0;
  } else if (Wavelength >= 580 && Wavelength < 645) {
    R = 1.0;
    G = -(Wavelength - 645) / (645 - 580);
    B = 0.0;
  } else if (Wavelength >= 645 && Wavelength <= 780) {
    R = 1.0;
    G = 0.0;
    B = 0.0;
  } else {
    R = 0.0;
    G = 0.0;
    B = 0.0;
  }

  let SSS;
  if (Wavelength >= 380 && Wavelength < 420) {
    SSS = 0.3 + 0.7 * (Wavelength - 380) / (420 - 380);
  } else if (Wavelength >= 420 && Wavelength <= 700) {
    SSS = 1.0;
  } else if (Wavelength > 700 && Wavelength <= 780) {
    SSS = 0.3 + 0.7 * (780 - Wavelength) / (780 - 700);
  } else {
    SSS = 0.0;
  }

  const r = Math.round(SSS * R * 255);
  const g = Math.round(SSS * G * 255);
  const b = Math.round(SSS * B * 255);

  return `rgb(${r}, ${g}, ${b})`;
}
