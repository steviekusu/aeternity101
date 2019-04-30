const contractAddress = 'ak_6A2vcm1Sz6aqJezkLCssUXcyZTX7X8D5UwbuS2fRJr9KkYpRU';
var client = null;
var memeArray = [];
var memesLength = 0;

function renderMemes() {
    memeArray = memeArray.sort(function (a, b) { return b.votes - a.votes })
    var template = $('#template').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, { memeArray });
    $('#memeBody').html(rendered);
}

async function callStatic(func, args, types) {
    const calledGet = await client.contractCallStatic
        (contractAddress, 'sophia-address', func, { args }).catch(e => console.error(e));
    const decodedGet = await client.contractDecodeData(types, calledGet.result.returnValue).catch(e => console.error(e));
    return decodedGet;
}

async function contractCall(func, args, value, types) {
    const calledSet = await client.contractCall(contractAddress, 'sophia-address', contractAddress, func, { args, options: { amount: value } }).catch(async e => {
        const decodedError = await client.contractDecodeData(types, e.returnValue).catch(e => console.error(e));
    });

    return
}


window.addEventListener('load', async () => {
    $("#loader").show();

    client = await Ae.Aepp();

    const getMemesLength = await callStatic('getMemesLength', '()', 'int');
    memesLength = getMemesLength.value;

    for (let i = 1; i <= memesLength; i++) {
        const meme = await callStatic('getMeme', `(${i})`, '(address, string, string, int,int)');

        memeArray.push({
            creatorName: meme.value[2].value,
            memeUrl: meme.value[1].value,
            index: i,
            votesValid: meme.value[3].value,
            votesInvalid: meme.value[4].value,
            votesNotsure: meme.value[5].value,
        })
    }

    renderMemes();

    $("#loader").hide();
});

jQuery("#memeBody").on("click", ".voteBtnValid", async function (event) {

    $("#loader").show();

    const value = 1;
    const dataIndex = event.target.id;

    await contractCall('voteMemeValid', `(${dataIndex})`, value, '(int)');

    const foundIndex = memeArray.findIndex(meme => meme.index == dataIndex);
    memeArray[foundIndex].votesValid += parseInt(value, 10);

    renderMemes();

    $("#loader").hide();

});

jQuery("#memeBody").on("click", ".voteBtnInvalid", async function (event) {

    $("#loader").show();

    const value = 1;
    const dataIndex = event.target.id;

    await contractCall('voteMemeInvalid', `(${dataIndex})`, value, '(int)');

    const foundIndex = memeArray.findIndex(meme => meme.index == dataIndex);
    memeArray[foundIndex].votesInvalid += parseInt(value, 10);

    renderMemes();

    $("#loader").hide();

});

jQuery("#memeBody").on("click", ".voteBtnNotsure", async function (event) {

    $("#loader").show();

    const value = 1;
    const dataIndex = event.target.id;

    await contractCall('voteMemeNotsure', `(${dataIndex})`, value, '(int)');

    const foundIndex = memeArray.findIndex(meme => meme.index == dataIndex);
    memeArray[foundIndex].votesNotsure += parseInt(value, 10);

    renderMemes();

    $("#loader").hide();

});

$('#registerBtn').click(async function () {

    $("#loader").show();

    const name = ($('#regName').val()),
        url = ($('#regUrl').val());

    await contractCall('registerMeme', `("${url}","${name}")`, 0, '(int)');

    memeArray.push({
        creatorName: name,
        memeUrl: url,
        index: memeArray.length + 1,
        votes: 0
    })

    renderMemes();

    $("#loader").hide();

});
