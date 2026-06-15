import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-profil',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profil.html',
})
export class Profil {

    patient = {
        nom: 'ADJOVI',
        prenoms: 'Yasmine Reine',
        dateNaissance: '14 Octobre 1985',
        age: 38,
        sexe: 'Féminin',
        civil: 'Mariée',
        naissanceMultiple: false,
        adresse: 'Carré 1245, Quartier Fidjrossè, Cotonou, Bénin',
        nin: 'BEN-982-110',
        photo: 'https://i.pravatar.cc/160?img=32',
    };

    contacts = [
        { type: 'Téléphone', valeur: '+229 97 00 00 00', priorite: 1, etiquette: 'Personnel', valide: true },
        { type: 'Email', valeur: 'yasmine.adjovi@email.bj', priorite: 2, etiquette: 'Professionnel', valide: false },
    ];

    personnesLiees = [
        { nom: 'Marc ADJOVI', relation: 'Époux', role: "Contact d'Urgence", telephone: '+229 96 11 22 33' },
        { nom: 'Hélène TOUPE', relation: 'Mère', role: 'Tuteur', telephone: '+229 95 44 55 66' },
    ];
}
