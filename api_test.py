import bs4
import requests
# import json
# raw_data=requests.get('https://3g.163.com/touch/reconstruct/article/list/BBM54PGAwangning/0-20.html',headers=header)
# data=json.loads(raw_data.text[9:-1])
# url=[]
# # get websitre link from api
# for x in range(0,20):
#         if(data['BBM54PGAwangning'][x]['url'][0:4]!="http"):
#                 continue
#         url.append(data['BBM54PGAwangning'][x]['url'])
# get html from api

class TextProcess:
        header = {
                'User-Agent': 'Mozilla/4.0(compatible;MSIE7.0;WindowsNT5.1)',
                'Connection': 'keep - alive',
        }
        store=[]
        def pure_text(self,item):
                if (not item.findChildren()):
                        # pure text
                        print(item.text)
                        self.store.append(("p",item.text))
                else:
                        if (item.find("a")):
                                # contain link
                                if("class" in item.attrs):
                                        # photo link
                                        if("photo" in item['class']):
                                                print("img:", item.find("a")["href"])
                                                self.store.append(("img", item.find("a")["href"]))
                                else:
                                        # article link
                                        print("link:", item.find("a")["href"])
                                        self.store.append(("link", item.find("a")["href"]))
                        elif(item.find_all("b")):
                                # bold
                                print("Bold:",item.find("b").text)
                                self.store.append(("b", item.find("b").text))
                        elif (item.find("strong")):
                                # strong
                                print("Storng:", item.find("strong").text)
                                self.store.append(("strong", item.find("strong").text))

        def process(self):
                url=raw_input()
                raw_data = requests.get(url, headers=self.header)
                soup = bs4.BeautifulSoup(raw_data.text, 'html.parser')
                main = soup.find("article")
                title = main.find("h1", class_="title").text
                time = main.find("span", class_="time js-time").text
                print(title)
                print(time)
                content = main.find_all("div", class_="page js-page on")
                for item in content[0]:
                        if type(item) is bs4.element.Tag:
                                self.pure_text(item)

                content = main.find_all("div", class_="page js-page")
                for page in content:
                        for item in page:
                                if type(item) is bs4.element.Tag:
                                        self.pure_text(item)


a=TextProcess()
a.process()
print(a.store)
