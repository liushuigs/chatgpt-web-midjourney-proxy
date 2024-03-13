declare namespace Express {
	export interface Response {
			authed?: boolean // I use string for example, you can put other type
			user?: {
				role: string
				name: string
				imageLimit: number
			}
	}
}
