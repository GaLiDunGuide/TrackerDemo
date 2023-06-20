import { Options, PageInfo, ReportData, ReportType, RouteType } from "../types/index";
import { wrap, SDKVersion } from "../utils/util";


export default class TrackingDemo {

    private dulation = {
        startTime: 0,
        value: 0,
    }

    private eventList = ["click", "dblclick", "mouseout", "mouseover"]

    private reportUrl = ''

    private uid = '';

    constructor(options:Options) {
      // 重写 pushState、replaceState
      window.history.pushState = wrap("pushState");
      window.history.replaceState = wrap("replaceState");

      this.reportUrl = options.reportUrl;

      this.initJSError();

      // 初始化事件数据收集
      this.initEventHandler();

      // 初始化PV统计
      this.initPV();

      this.initPageDulation();
    }

    setUserId(uid: string) {
      this.uid = uid;
    }

    private initJSError() {
        window.addEventListener("error", (e) => {
          this._report(ReportType.ERROR, {
            message: e.message,
          });
        });
  
        window.addEventListener("unhandledrejection", (e) => {
          this._report(ReportType.ERROR, {
            message: e.reason,
          });
        });
    }

    private initEventHandler() {
      this.eventList.forEach((event) => {
        window.addEventListener(event, (e: Event) => {
          const target = e.target as HTMLElement;
          const reportKey = target.getAttribute("report-key");
          if (reportKey) {
            this._report(ReportType.EVENT, {
              tagName: target.nodeName,
              tagText: target.innerText,
              event,
            });
          }
        });
      });
    }

    private initPV() {
      window.addEventListener("pushState", (e) => {
        this._report(ReportType.PV, {
          type: RouteType.PUSH,
          referrer: document.referrer,
        });
      });

      window.addEventListener("replaceState", (e) => {
        this._report(ReportType.PV, {
          type: RouteType.REPLACE,
          referrer: document.referrer,
        });
      });

      window.addEventListener("hashchange", () => {
        this._report(ReportType.PV, {
          type: RouteType.HASH,
          referrer: document.referrer,
        });
      });
    }

    private initPageDulation() {
      let self = this;

      function initDulation():void {
        const time = new Date().getTime();
        self.dulation.value = time - self.dulation.startTime;

        self._report(ReportType.DULATION, {
            ...self.dulation,
        });

        self.dulation.startTime = time;
        self.dulation.value = 0;
      }

      // 首次进入页面
      window.addEventListener("load", () => {
        // 记录时间
        const time = new Date().getTime();
        this.dulation.startTime = time;
      });

      // 单页应用页面跳转(触发 replaceState)
      window.addEventListener("replaceState", () => {
        initDulation();
      });

      // 单页应用页面跳转(触发 pushState)
      window.addEventListener("pushState", () => {
        initDulation();
      });

      // 非单页应用跳转触发 popstate
      window.addEventListener("popstate", () => {
        initDulation();
      });

      // 页面没有任何跳转, 直接关闭页面的情况
      window.addEventListener("beforeunload", () => {
        initDulation();
      });
    }

    // 用户可主动上报
    reportTracker(data:any) {
      this._report(ReportType.CUSTOM, data);
    }

    _getPageInfo(): PageInfo {
      const { width, height } = window.screen;
      const { userAgent } = navigator;
      return {
        uid: this.uid,
        title: document.title,
        url: window.location.href,
        time: new Date().getTime(),
        ua: userAgent,
        screen: `${width}x${height}`,
      };
    }

    _report(type: ReportType, data:any) {
      const reportData: ReportData = {
        ...this._getPageInfo(),
        type,
        data,
        sdk: SDKVersion,
      };

      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.reportUrl, JSON.stringify(reportData));
      } else {
        const imgReq = new Image();
        imgReq.src = `${this.reportUrl}?params=${JSON.stringify(
          reportData
        )}&t=${new Date().getTime()}`;
      }
    }
  }