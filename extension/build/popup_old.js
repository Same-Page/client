var whitelist = {};
var pageURL = null;
var configDataFromStorage = {};
var chatboxOpenState = false;
// visible strings
var openBoxStr= 'Open';
var closeBoxStr = 'Close';
var displaySamePageUserCount = 'Show same page/site user number';
var defaultDisplayModeStr = 'Default display mode for chat box';
var fullStr = 'Full';
var miniStr = 'Mini';
var hiddenStr = 'Hidden';
var invitationStr = 'Show scrolling message for invitation';
var fromAnywhereStr= 'From anywhere';
var fromSameSiteOnlyStr = 'From same website only';
var fromNowhereStr = 'Never';
var danmuStr = 'Show scrolling message for live chat';
var yesStr = 'Yes';
var noStr = 'No';
var autoJoinAnywhereStr = 'Auto join live chat on any website';
var autoJoinStr = 'Auto join live chat on current website';
var autoJoinListStr = 'Auto join live chat on following sites';
var emptyListStr = 'Never auto join live chat.';
var videoDanmuStr = 'Show scrolling comment on Youtube';

var lng = window.navigator.userLanguage || window.navigator.language;
if (lng.indexOf('zh')>-1) {
    openBoxStr = '打开';
    closeBoxStr = '关闭';
    displaySamePageUserCount = '显示同页/同站用户数';
    defaultDisplayModeStr = '聊天盒默认显示模式';
    fullStr = '正常显示';
    miniStr ='最小化';
    hiddenStr = '不显示';
    invitationStr = '显示邀请弹幕';
    fromAnywhereStr = '显示来自任何网站的邀请';
    fromSameSiteOnlyStr = '只显示来自当前网站的邀请';
    fromNowhereStr = '从不显示';
    danmuStr = '显示实时聊天弹幕';
    yesStr = '是';
    noStr = '否';
    autoJoinAnywhereStr = '浏览任何网站时都自动连线聊天';
    autoJoinStr = '浏览当前网站时自动连线聊天';
    autoJoinListStr = '浏览以下网站时自动连线聊天';
    emptyListStr = '浏览任何网站时都不会自动连线。';
    videoDanmuStr = '显示Youtube留言弹幕';
}
function renderWhitelist() {

    // if (pageURL in whitelist) {
    //     $('#open-chatbox').show();
    // } else {
    //     $('#open-chatbox').hide();
    // }

    $('.whitelist').empty();
    var counter = 0;
    for (var url in whitelist) {
        counter++;
        var $urlEntry = $('<div class="whitelist-url"></div>');
        var $removeBtn = $('<span class="remove-url">X</span>');
        if (url == pageURL) $urlEntry.addClass('current');
        $removeBtn.data('url',url);
        $urlEntry.text(url);
        $urlEntry.append($removeBtn);

        $removeBtn.click(function() {
            var _url = $(this).data('url');
            delete whitelist[_url];
            chrome.storage.local.set({ 'whitelist': whitelist }, getWhitelist);
            renderWhitelist();

        })
        $('.whitelist').append($urlEntry);
    }
    if (!counter) {
        var $emptyListP = $('<p></p>');
        $emptyListP.text(emptyListStr);
        $('.whitelist').append($emptyListP);
    }
}

function getWhitelist() {
    chrome.storage.local.get('whitelist', function(data) {
        console.log('Get whitelist from storage.local');
        whitelist = data['whitelist'] || whitelist;
        var enabled = 'no';
        if (pageURL in whitelist) {
            enabled = 'yes';
        }
        var checkbox = "input[name=toggle_whitelist][value="+enabled+"]";
        $(checkbox).prop("checked", true);
        renderWhitelist();
    });
}

function msgChatboxFrame(msg, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
        // since only one tab should be active and in the current window at once
        // the return variable should only have one entry
        var activeTab = arrayOfTabs[0];
        var activeTabId = activeTab.id;
        // This message is listened by chatbox, but not content.js. 
        // then chatbox pass msg to content.js to resize iframe
        chrome.tabs.sendMessage(activeTabId, {chatboxMsg: msg}, callback);

        if (pageURL) return;

        pageURL = extractRootDomain(activeTab.url);
        getWhitelist();

    });
}

function showHideChatbox() {
    var msg = 'open_chatbox';
    if (chatboxOpenState) {
        msg = 'close_chatbox';
    }
    msgChatboxFrame(msg, function(resp){
        if (resp && resp.msg == "shown") { 
            $('.open-chatbox').text(closeBoxStr);
            chatboxOpenState = true;
        }
        if (resp && resp.msg == "closed") { 
            $('.open-chatbox').text(openBoxStr);
            chatboxOpenState = false;
        }

    });
}
function showHideDanmu(type, val) {
    var msg = {
        'name': 'toggle-danmu',
        'type': type,
        'value': val
    }
    msgChatboxFrame(msg);
}

function checkChatboxStatus() {
    // console.log('Check if chatbox open and get online user count');
    // Ask chatbox whether it's open or not
    // And how many users online at current page
    msgChatboxFrame('is_chatbox_open', function(resp){
        setTimeout(function(){
            checkChatboxStatus();
        }, 3000); 
        if (resp) {
            if (resp.is_chatbox_open) { 
                $('.open-chatbox').text(closeBoxStr);
                chatboxOpenState = true;
            }
            else { 
                $('.open-chatbox').text(openBoxStr);
                chatboxOpenState = false;
            }
            if (resp.userCount > 0) {
                $('#user-count').text(resp.userCount);
                $('#online-user-msg').show();
            }
            // do this every 3 sec to pull latest user count
        } else {
            $('#online-user-msg').text('Please try refreshing this page.');
            $('#online-user-msg').show();
        }
    });
}
function toggleWhitelistOptions (enable) {
    // if auto join live chat anywhere is selected
    // no need to show whitelist options
    if (enable) {
        $('.whitelist-options').show();
        $('.whitelist-options').removeClass('disabled');
        $('.whitelist-options input').prop('disabled', false);
    } else {
        $('.whitelist-options').hide();
        $('.whitelist-options').addClass('disabled');
        $('.whitelist-options input').prop('disabled', true);
    }

}
document.addEventListener('DOMContentLoaded', function () {
    $('button.open-chatbox').text(openBoxStr);
    $('.same-page-count').text(displaySamePageUserCount);
    $('.display-mode').text(defaultDisplayModeStr);
    $('label .full').text(fullStr);
    $('label .mini').text(miniStr);
    $('label .hidden').text(hiddenStr);
    $('.invitation-danmu').text(invitationStr);
    $('.video-danmu').text(videoDanmuStr);
    $('label .invitation-from-anywhere').text(fromAnywhereStr);
    $('label .same-site-invite-only').text(fromSameSiteOnlyStr);
    $('label .invitation-from-nowhere').text(fromNowhereStr);
    $('.danmu').text(danmuStr);
    $('label .yes').text(yesStr);
    $('label .no').text(noStr);
    $('.auto-join-anywhere').text(autoJoinAnywhereStr);
    $('.auto-join').text(autoJoinStr);
    $('.auto-join-list').text(autoJoinListStr);

    $('.open-chatbox').click(showHideChatbox);
    $('body').on('click', 'a', function(){
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
    });
    chrome.storage.local.get('chatbox_config', function(data) {
        var configDataFromStorage = data['chatbox_config'] || {};
        if ('display' in configDataFromStorage) {
            var checkbox = "input[name=default_display][value="+configDataFromStorage['display']+"]";
            $(checkbox).prop("checked",true);
        }
        if ('show_same_page_user_count' in configDataFromStorage) {
            var val = configDataFromStorage['show_same_page_user_count'];
            if (val) val = 'yes';
            else val = 'no';
            var checkbox = "input[name=show_same_page_user_count][value="+val+"]";
            $(checkbox).prop("checked",true);
        }
        if ('invitation_danmu' in configDataFromStorage) {
            var checkbox = "input[name=invitation_danmu][value="+configDataFromStorage['invitation_danmu']+"]";
            $(checkbox).prop("checked",true);
        }
        if ('livechat_danmu' in configDataFromStorage) {
            var val = configDataFromStorage['livechat_danmu'];
            if (val) val = 'yes';
            else val = 'no';
            var checkbox = "input[name=livechat_danmu][value="+val+"]";
            $(checkbox).prop("checked",true);
        }
        if ('video_danmu' in configDataFromStorage) {
            var val = configDataFromStorage['video_danmu'];
            if (val) val = 'yes';
            else val = 'no';
            var checkbox = "input[name=video_danmu][value="+val+"]";
            $(checkbox).prop("checked",true);
        }
        if ('livechat_anywhere' in configDataFromStorage) {
            var val = configDataFromStorage['livechat_anywhere'];
            toggleWhitelistOptions(!val);
            if (val) val = 'yes';
            else val = 'no';
            var checkbox = "input[name=livechat_anywhere][value="+val+"]";
            $(checkbox).prop("checked",true);
        } else {
            toggleWhitelistOptions(false);
        }
    });
    $('input:radio[name="show_same_page_user_count"]').change(function() {
        var val = $(this).val();
        if (val == 'yes') val = true;
        else val = false;
        saveConfig('show_same_page_user_count', val);
    });
    $('input:radio[name="default_display"]').change(function() {
        var val = $(this).val();
        saveConfig('display', val);
    });
    $('input:radio[name="livechat_anywhere"]').change(function() {
        var val = $(this).val();
        if (val == 'yes') val = true;
        else val = false;
        saveConfig('livechat_anywhere', val);
        toggleWhitelistOptions(!val);
    });
    $('input:radio[name="video_danmu"]').change(function() {
        var val = $(this).val();
        if (val == 'yes') val = true;
        else val = false;
        //TODO
        // showHideDanmu('video_danmu', val);
        saveConfig('video_danmu', val);
    });
    $('input:radio[name="livechat_danmu"]').change(function() {
        var val = $(this).val();
        if (val == 'yes') val = true;
        else val = false;
        showHideDanmu('livechat', val);
        saveConfig('livechat_danmu', val);
    });
    $('input:radio[name="invitation_danmu"]').change(function() {
        var val = $(this).val();
        showHideDanmu('invitation', val);
        saveConfig('invitation_danmu', val);
    });
    $('input:radio[name="toggle_whitelist"]').change(function() {
        if ($(this).val() == 'yes') {
            console.log('adding to whitelist');
            whitelist[pageURL]=1;
            // msgChatboxFrame('connect_chatbox');
        } else {
            console.log('removing from whitelist');
            delete whitelist[pageURL];
            // msgChatboxFrame('disconnect_chatbox');
        }
        chrome.storage.local.set({ 'whitelist': whitelist });
        renderWhitelist();
    });
    checkChatboxStatus();

});
function saveConfig(key, value) {
    // IMPORTANT: async
    // get latest setting of chatbox_config then update a field
    chrome.storage.local.get('chatbox_config', function(data) {
        var configDataFromStorage = data['chatbox_config'] || {};
        configDataFromStorage[key] = value;
        chrome.storage.local.set({'chatbox_config': configDataFromStorage});
    });
}
function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

// To address those who want the "root domain," use this function:
function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}
