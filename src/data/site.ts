/**
 * Site-wide constants (PRD §5). Import from here — never repeat company data
 * in components.
 */

const addressStreet = 'Nikole Šubića Zrinskog 32';
const addressPostalCode = '31220';
const addressCity = 'Višnjevac';
const addressFull = `${addressStreet}, ${addressPostalCode} ${addressCity}`;

export const site = {
	name: 'GAJA TRANS',
	legalName: 'GAJA TRANS j.d.o.o.',
	oib: '03762709970',
	phone: {
		display: '099 213 2638',
		href: 'tel:+385992132638',
		international: '+385992132638',
	},
	whatsapp: 'https://wa.me/385992132638',
	// TODO: replace with the client's real profile URLs (placeholders, user decision).
	social: {
		facebook: '#',
		instagram: '#',
	},
	email: 'gajatrans2025@gmail.com',
	address: {
		street: addressStreet,
		postalCode: addressPostalCode,
		city: addressCity,
		country: 'HR',
		full: addressFull,
		mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressFull)}`,
	},
} as const;

export interface NavItem {
	label: string;
	href: string;
}

export const navItems: NavItem[] = [
	{ label: 'Početna', href: '/' },
	{ label: 'O nama', href: '/o-nama' },
	{ label: 'Usluge', href: '/usluge' },
	{ label: 'Galerija', href: '/galerija' },
	{ label: 'Kontakt', href: '/kontakt' },
];

/**
 * Exact service names (PRD §2.2) and their slugs. The slug is the anchor id
 * of the service on /usluge (e.g. /usluge#selidbe), so the Usluge page must
 * use these same ids.
 */
export const services = [
	{ name: 'Prijevoz i dostava', slug: 'prijevoz-i-dostava' },
	{ name: 'Selidbe', slug: 'selidbe' },
	{ name: 'Skladištenje', slug: 'skladistenje' },
	{ name: 'Uređenje okoliša', slug: 'uredenje-okolisa' },
	{ name: 'Čišćenje prostora', slug: 'ciscenje-prostora' },
	{ name: 'Dodatne usluge', slug: 'dodatne-usluge' },
] as const;

export type Service = (typeof services)[number];
export type ServiceSlug = Service['slug'];
