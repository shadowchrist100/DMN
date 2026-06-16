from enum import Enum

class Genre(str, Enum):
    M = "M"
    F = "F"
    AUTRE = "Autre"

class SituationMatrimoniale(str, Enum):
    CELIBATAIRE = "Célibataire"
    MARIE = "Marié(e)"
    DIVORCE = "Divorcé(e)"
    VEUF = "Veuf(ve)"

class StatutCompte(str, Enum):
    ACTIF = "Actif"
    INACTIF = "Inactif"
    SUSPENDU = "Suspendu"

class StatutVerification(str, Enum):
    EN_ATTENTE = "En attente"
    VALIDE = "Validé"
    REJETE = "Rejeté"

class StatutPrescription(str, Enum):
    EN_COURS = "En cours"
    DISPENSE = "Dispensé"
    ANNULE = "Annulé"
    TERMINE = "Terminé"

class TypeActe(str, Enum):
    CONSULTATION = "Consultation"
    CHIRURGIE = "Chirurgie"
    EXAMEN = "Examen"
    VACCINATION = "VACCINATION"
    AUTRE = "Autre"

class Speciality(str, Enum):
    MEDECIN = "medecin"
    INFIRMIER = "infirmier"
    CHIRURGIEN = "chirurgien"
    PEDIATRE = "pediatre"
    GYNECOLOGUE = "gynecologue"
    RADIOLOGUE = "radiologue"
    BIOLOGISTE = "biologiste"
    PHARMACIEN = "pharmacien"
    DENTISTE = "dentiste"
    AUTRE = "autre"

class Perimeter(str, Enum):
    ALL = "all"
    PRESCRIPTIONS = "prescriptions"

class Duration(str, Enum):
    MIN_30 = "30min"
    H_1 = "1h"

class DiagnosisVerification(str, Enum):
    CONFIRMED = "confirmed"
    SUSPECTED = "suspected"
    REJECTED = "rejected"

class TypePrescription(str, Enum):
    VACCIN = "vaccin"
    EXAMINATION = "examination"

class TypeDirective(str, Enum):
    MEDICAMENT = "medicament"
    SOINS_REED_KINE = "soins_reed_kine" # Kiné, rééducation, infirmiers...
    MODE_DE_VIE = "mode_de_vie"

class NatureExamination(str, Enum):
    labo = "LABORATOIRE"
    analyse = "ANALYSE"
    radiographie = "radiographie"