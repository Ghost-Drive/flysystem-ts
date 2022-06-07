/* eslint-disable no-shadow */
export type QStr =
    | ' and '
    | ' or '
    | ' not '
    | ' contains '
    | ' = '
    | ' != '
    | ' >= '
    | ' <= '
    | ' > '
    | ' < '
    | ' in '
    | ' name '
    | ' visibility '
    | ' trashed '
    | ' mimeType '
    | ' fullText '
    | ' parents '
    | ' writers '
    | ' modifiedTime '
    | ' sharedWithMe '
    | ' true '
    | ' false '
    | ' "limited" ';

export class QBuilder {
    private constructor(private accStr: string) {}

    public static start() {
        return new QBuilder('');
    }

    public _(word: string) {
        this.accStr += word;
    }

    public $(qWord: QStr) {
        this.accStr += qWord;
    }

    public end() {
        const resutl = this.accStr;

        this.accStr = '';

        return resutl;
    }
}
