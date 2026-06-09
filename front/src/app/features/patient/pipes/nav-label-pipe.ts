import { Pipe, PipeTransform } from '@angular/core';
import { NavItem } from '../Types/dashboard.types';

@Pipe({
  name: 'navLabel',
})
export class NavLabelPipe implements PipeTransform {
  transform(navItems: NavItem[], view: String): string {
    return navItems.find(item => item.key === view)?.icon ?? 'dashboard';
  }
}
