import { BackpackTFAPI } from 'backpack.tf-api';

import * as backpacktf from '../src/backpack.tf';


test('Fetches backpack.tf website & checks if notifications are getting returned.', async () => {
    require('dotenv').config();
    const backpackClient = new BackpackTFAPI({
        token: process.env.BACKPACK_TOKEN,
    });

    const unreadNotifications = await backpacktf.markNotificationsAsReadAndReturn(backpackClient);
    expect(unreadNotifications?.length).toBeGreaterThanOrEqual(0);
});