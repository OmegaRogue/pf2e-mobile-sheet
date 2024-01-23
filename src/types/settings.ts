export type ShareTargetSettingsOptions = {
	send: boolean;
	recieve: boolean;
	index: number;
	name: string;
	role: string;
	color: string;
} & Partial<FormApplicationOptions>;
