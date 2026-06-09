import { Pipe, PipeTransform } from '@angular/core';
import { NavItem, ViewKey } from '../Types/dashboard.types';


@Pipe({
    name: 'navIcon',
})
export class NavIconPipe implements PipeTransform {
    transform(navItems: NavItem[], view: String): string {
        return navItems.find(item => item.key === view)?.icon ?? 'dashboard';
    }
}
