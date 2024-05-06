export default function RandomColorGenerator() {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

  const randomIndex = Math.floor(Math.random() * colors.length);
  const randomColor = colors[randomIndex];
  const randomNumber = Math.floor(Math.random() * 5) + 7;

  return `$${randomColor}${randomNumber}Dark`;
}
