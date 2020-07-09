export class FixturesCommand {
    static command = 'fixtures';
    static description = 'fixtures data in Elastic';

    async run() {
        console.log('fixture executing');
    }
}