import {DataSource} from "../../../Annotator/Store/DataSource";
import {Label} from "../../../Annotator/Store/Label";
import {Store} from "../../../Annotator/Store/Store";
import {expect} from 'chai';

class StubDataSource implements DataSource {
    getLabels(): Array<Label> {
        return [];
    }

    getRawContent(): string {
        return "\n\n  测试。\n\n" +
            "  测试 。  测试，测试？！  ？ ！   测试测试\n" +
            "测试 \n" +
            "测试测试  \n";
    }

}

describe('Store正确地构造出来了', () => {
    let store = new Store(new StubDataSource());
    it('将文本解析成几个段', () => {
        let paragraphs = store.paragraphs.map(it => it.toString());
        expect(paragraphs).not.include("\n\n");
        expect(paragraphs).include("测试。");
        expect(paragraphs).include("测试 。  测试，测试？！  ？ ！   测试测试");
        expect(paragraphs).include("测试测试");
    });
    it('将段又分成句', () => {
        let theParagraph = store.paragraphs[1];
        expect(theParagraph.toString()).equals("测试 。  测试，测试？！  ？ ！   测试测试");
        let sentences = theParagraph.sentences.map(it => it.toString());
        expect(sentences).include("测试 。");
        expect(sentences).not.include("\n\n");
        expect(sentences).include("测试，测试？！  ？ ！");
        expect(sentences).include("测试测试");
    });
    it('加入标注会让段合并起来', () => {
        store.addLabel(new Label("测试", 6, 13));
        let paragraphs = store.paragraphs.map(it => it.toString());
        expect(paragraphs).not.include("测试。");
        expect(paragraphs).not.include("测试 。  测试，测试？！  ？ ！   测试测试");
        expect(paragraphs).include("测试。\n\n  测试 。  测试，测试？！  ？ ！   测试测试");
        expect(paragraphs).include("测试测试");
    });
    it('还会让句子合并起来', () => {
        store.addLabel(new Label("测试", 14, 19));
        let theParagraph = store.paragraphs[0];
        let sentences = theParagraph.sentences.map(it => it.toString());
        expect(sentences).not.include("\n\n");
        expect(sentences).not.include("测试 。");
        expect(sentences).not.include("测试，测试？！  ？ ！");
        expect(sentences).not.include("测试 。  测试，测试？！  ？ ！");
        expect(sentences).include("测试。\n\n  测试 。  测试，测试？！  ？ ！");
    });
});