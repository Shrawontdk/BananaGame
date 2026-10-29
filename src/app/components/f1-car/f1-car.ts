import { Component, input } from '@angular/core';
@Component({
  selector: 'app-f1-car',
  standalone: true,
  template: `<svg
    viewBox="0 0 200 84"
    role="img"
    [attr.aria-label]="label() + (rank() ? ', P' + rank() : ', outside the top 20')"
    [style.width.px]="170 * scale()"
    [style.color]="color()"
  >
    <g fill="#080b10" stroke="#727989" stroke-width="1.5">
      <rect x="32" y="3" width="35" height="20" rx="5" />
      <rect x="32" y="61" width="35" height="20" rx="5" />
      <rect x="140" y="5" width="29" height="18" rx="5" />
      <rect x="140" y="61" width="29" height="18" rx="5" />
    </g>
    <g stroke="#9aa3b2" stroke-width="3">
      <path d="M49 20L90 36M49 64L90 48M150 21L125 35M150 63L125 49" />
    </g>
    <g
      fill="currentColor"
      [attr.stroke]="color() === '#193b78' ? '#6386bc' : '#111721'"
      stroke-width="2"
    >
      <path d="M19 17H34V67H19Z" />
      <path d="M36 29L73 22L128 30L181 36V48L128 54L73 62L36 55Z" />
      <path d="M174 15H185V69H174Z" />
    </g>
    <path d="M62 30H119L144 37H80Z" fill="#fff" opacity=".35" />
    <ellipse cx="103" cy="42" rx="19" ry="10" fill="#141c2a" stroke="#e8edf5" stroke-width="2" />
    <circle cx="103" cy="42" r="6" fill="#f3f5fb" />
    <path d="M111 31V53M83 42H122" stroke="currentColor" stroke-width="3" />
    <text
      x="53"
      y="46"
      text-anchor="middle"
      font-size="13"
      font-weight="900"
      [attr.fill]="color() === '#193b78' ? '#f3f5fb' : '#111721'"
    >
      {{ rank() ?? '?' }}
    </text>
    <path d="M153 39H174" stroke="#f8faff" stroke-width="2" />
  </svg>`,
  styles: [':host{display:inline-flex;align-items:center}svg{display:block;height:auto}'],
})
export class F1Car {
  color = input('#ffe45c');
  label = input('Driver');
  scale = input(1);
  rank = input<number | null>(1);
}
