import Avatar0 from './avatar0.webp';
import Avatar1 from './avatar1.webp';
import Avatar2 from './avatar2.webp';
import Avatar3 from './avatar3.webp';
import Avatar4 from './avatar4.webp';
import Avatar5 from './avatar5.webp';
import Avatar6 from './avatar6.webp';
import Avatar7 from './avatar7.webp';
import Avatar8 from './avatar8.webp';
import Avatar9 from './avatar9.webp';
import Avatar10 from './avatar10.webp';
import Avatar11 from './avatar11.webp';
import Avatar12 from './avatar12.webp';
import Avatar13 from './avatar13.webp';
import Avatar14 from './avatar14.webp';
import Avatar15 from './avatar15.webp';

export const AVATARS = {
	avatar0: Avatar0,
	avatar1: Avatar1,
	avatar2: Avatar2,
	avatar3: Avatar3,
	avatar4: Avatar4,
	avatar5: Avatar5,
	avatar6: Avatar6,
	avatar7: Avatar7,
	avatar8: Avatar8,
	avatar9: Avatar9,
	avatar10: Avatar10,
	avatar11: Avatar11,
	avatar12: Avatar12,
	avatar13: Avatar13,
	avatar14: Avatar14,
	avatar15: Avatar15,
};

export type AvatarId = keyof typeof AVATARS;

export const AVATAR_ENTRIES = Object.entries(AVATARS) as [AvatarId, string][];
