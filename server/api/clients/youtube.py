import re
from math import pow
import requests

api_keys = [
    "AIzaSyDw5e5lpOpWKLQa-aU-qxJeHI1KBbh88mQ",
    "AIzaSyC25RGUYZAT8j6TgPLSDj56duhBjckETiE",
    "AIzaSyCjt2Zce0KOC4vUsvQgB-53vAOpoQm8lmk",
    "AIzaSyDjzH4Cbm6ZWti8zkaVlCcJAFyy7KQxHfM"
]
api_key_index = 0
api_url = "https://www.googleapis.com/youtube/v3/commentThreads"
page_size = 100  # 1-100
result_order = "relevance"
parts = "snippet,replies"

# Put comments without timestamp at -1 sec
no_timestamp_sec = -1


def get_comments(comments, video_id, page_token=None):
    global api_key_index
    params = {
        "part": parts,
        "key": api_keys[api_key_index],
        "maxResults": page_size,
        "order": result_order,
        "videoId": video_id,
        "pageToken": page_token,
    }
    resp = requests.get(api_url, params=params)
    if resp.ok:
        data = resp.json()
        for item in data['items']:
            # Handle top level comment first then replies to the comment
            top_level_comment_snippet = item['snippet']['topLevelComment']['snippet']
            sec = _buildCommentFromSnippetIfFindTime(
                top_level_comment_snippet, comments)
            if not sec:
                sec = no_timestamp_sec
                _buildCommentFromSnippet(
                    top_level_comment_snippet, comments, sec)

            if item.get('replies') and item['replies']['comments']:
                # item.replies.comments seems latest first
                # we want it in time order so reverse it
                # if that's not right, TODO: sort by publishedAt
                item['replies']['comments'].reverse()
                for comment in item['replies']['comments']:
                    # if the parent comment has timestamp,
                    # replies should show together with parent
                    _buildCommentFromSnippet(
                        comment['snippet'], comments, sec)

    else:
        print(
            f'youtube api failure {resp.status_code}, api_key_index {api_key_index}')
        api_key_index = api_key_index + 1
        api_key_index = api_key_index % len(api_keys)
    return comments


def _buildCommentFromSnippet(snippet, comments, sec):

    # Given url is 28x28 small, get raw image instead
    # chagne https://yt3.ggpht.com/-U3yPihiV3Ew/AAAAAAAAAAI/AAAAAAAAAAA/RtPagEHtnBA/s28-c-k-no-mo-rj-c0xffffff/photo.jpg
    comment = {
        "content": snippet["textOriginal"],
        "user": {
            "name": snippet["authorDisplayName"],
            "avatarSrc": snippet["authorProfileImageUrl"].replace('s28', 's128'),
        }
        # content: snippet.textDisplay.replace(link[0], ''),
        # href: link[0] // need it?
    }
    comments[sec].append(comment)


def _buildCommentFromSnippetIfFindTime(snippet, comments):
    # if there is time found then save the comment
    # and return the time found
    text_display = snippet['textDisplay']
    if '&amp;t=' in text_display:
        time_str = _getTextFromHyperlink(text_display)
        if time_str and 'http' not in time_str:
            # Sometimes the text_display is
            # <a href="https://www.youtube.com/watch?v=Ju8RTO3db6M&amp;t=10s">https://www.youtube.com/watch?v=Ju8RTO3db6M&amp;t=10s</a>
            # causing time_str to be https://www.youtube.com/watch?v=Ju8RTO3db6M&amp;t=10s
            # TODO: handle such case
            sec = _timeToSec(time_str)
            _buildCommentFromSnippet(snippet, comments, sec)
            return sec
    return None


def _timeToSec(rawTime):
    # hr:min:sec ->  sec
    times = rawTime.split(':')
    times.reverse()
    sec = 0
    for i, t in enumerate(times):
        sec = sec + int(int(times[i]) * pow(60, i))
    return sec


def _getTextFromHyperlink(input):
    pattern = r">(.*?)</a>"
    res = re.findall(pattern, input, flags=0)
    if len(res) > 0:
        return res[0]
    return None
    # expects something like '<a href="#" class="taskName">foo bar baz</a>'
    # TODO: can this match if multiple anchor tag?
    # return input.match(/<a [^>]+>([^<]+)<\/a>/);
