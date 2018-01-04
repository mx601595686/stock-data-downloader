"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schedule = require("node-schedule");
const service_starter_1 = require("service-starter");
const sql = require("./Sql");
const SH_A_Code_sjs_1 = require("./downloader/SH_A_Code_sjs");
const SZ_A_Code_sjs_1 = require("./downloader/SZ_A_Code_sjs");
/**
 * 股票代码下载器
 */
class StockCodeDownloader extends service_starter_1.BaseServiceModule {
    constructor() {
        super(...arguments);
        this._downloading = false; //是否正在下载
    }
    /**
     * 保存下载到的数据
     */
    async _saveData(data) {
        for (const item of data) {
            const id = await this._connection.asyncQuery(sql.get_id, [item.code, item.market, item.isIndex]);
            if (id.length > 0) {
                await this._connection.asyncQuery(sql.update_data, [item.name, id[0].id]);
            }
            else {
                await this._connection.asyncQuery(sql.insert_data, [item.code, item.name, item.market, item.isIndex]);
            }
        }
    }
    /**
     * 下载器
     */
    async _downloader() {
        if (!this._downloading) {
            this._downloading = true;
            const jobID = await this._statusRecorder.newStartTime(this);
            try {
                await this._saveData(await SH_A_Code_sjs_1.SH_A_Code_sjs().catch(err => { throw new Error('下载上交所股票代码异常：' + err); }));
                await this._saveData(await SZ_A_Code_sjs_1.SZ_A_Code_sjs().catch(err => { throw new Error('下载深交所股票代码异常：' + err); }));
                await this._statusRecorder.updateEndTime(this, jobID);
            }
            catch (error) {
                await this._statusRecorder.updateError(this, jobID, error);
                throw error;
            }
            finally {
                this._downloading = false;
            }
        }
    }
    ;
    async onStart() {
        this._connection = this.services.MysqlConnection;
        this._statusRecorder = this.services.ModuleStatusRecorder;
        await this._connection.asyncQuery(sql.create_table); //创建数据表
        debugger;
        const status = await this._statusRecorder.getStatus(this);
        if (status == null || status.error != null || status.startTime > status.endTime) {
            //如果没下载过或上次下载出现过异常，则立即重新下载
            await this._downloader();
        }
        //每周星期五的10点钟更新
        this._timer = schedule.scheduleJob({ hour: 10, dayOfWeek: 5 }, () => this._downloader().catch(err => this.emit('error', err)));
    }
    async onStop() {
        this._timer.cancel();
    }
}
exports.StockCodeDownloader = StockCodeDownloader;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvU3RvY2tDb2RlRG93bmxvYWRlci9TdG9ja0NvZGVEb3dubG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMENBQTBDO0FBQzFDLHFEQUFvRDtBQUVwRCw2QkFBNkI7QUFLN0IsOERBQTJEO0FBQzNELDhEQUEyRDtBQUUzRDs7R0FFRztBQUNILHlCQUFpQyxTQUFRLG1DQUFpQjtJQUExRDs7UUFLWSxpQkFBWSxHQUFZLEtBQUssQ0FBQyxDQUFFLFFBQVE7SUF3RHBELENBQUM7SUF0REc7O09BRUc7SUFDSyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQXFCO1FBQ3pDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2pHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEIsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RSxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDMUcsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxLQUFLLENBQUMsV0FBVztRQUNyQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFNUQsSUFBSSxDQUFDO2dCQUNELE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLDZCQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLDZCQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXBHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFELENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNiLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxLQUFLLENBQUM7WUFDaEIsQ0FBQztvQkFBUyxDQUFDO2dCQUNQLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzlCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsT0FBTztRQUNULElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUM7UUFDakQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDO1FBQzFELE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUUsT0FBTztRQUNyRSxRQUFRLENBQUE7UUFDQSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFELEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUM5RSwwQkFBMEI7WUFDMUIsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELGNBQWM7UUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25JLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDekIsQ0FBQztDQUNKO0FBN0RELGtEQTZEQyIsImZpbGUiOiJtb2R1bGVzL1N0b2NrQ29kZURvd25sb2FkZXIvU3RvY2tDb2RlRG93bmxvYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNjaGVkdWxlIGZyb20gJ25vZGUtc2NoZWR1bGUnO1xyXG5pbXBvcnQgeyBCYXNlU2VydmljZU1vZHVsZSB9IGZyb20gXCJzZXJ2aWNlLXN0YXJ0ZXJcIjtcclxuXHJcbmltcG9ydCAqIGFzIHNxbCBmcm9tICcuL1NxbCc7XHJcbmltcG9ydCB7IE15c3FsQ29ubmVjdGlvbiB9IGZyb20gXCIuLi9NeXNxbENvbm5lY3Rpb24vTXlzcWxDb25uZWN0aW9uXCI7XHJcbmltcG9ydCB7IE1vZHVsZVN0YXR1c1JlY29yZGVyIH0gZnJvbSBcIi4uL01vZHVsZVN0YXR1c1JlY29yZGVyL01vZHVsZVN0YXR1c1JlY29yZGVyXCI7XHJcbmltcG9ydCB7IFN0b2NrQ29kZVR5cGUgfSBmcm9tICcuL1N0b2NrQ29kZVR5cGUnO1xyXG5cclxuaW1wb3J0IHsgU0hfQV9Db2RlX3NqcyB9IGZyb20gXCIuL2Rvd25sb2FkZXIvU0hfQV9Db2RlX3Nqc1wiO1xyXG5pbXBvcnQgeyBTWl9BX0NvZGVfc2pzIH0gZnJvbSBcIi4vZG93bmxvYWRlci9TWl9BX0NvZGVfc2pzXCI7XHJcblxyXG4vKipcclxuICog6IKh56Wo5Luj56CB5LiL6L295ZmoXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU3RvY2tDb2RlRG93bmxvYWRlciBleHRlbmRzIEJhc2VTZXJ2aWNlTW9kdWxlIHtcclxuXHJcbiAgICBwcml2YXRlIF90aW1lcjogc2NoZWR1bGUuSm9iOyAgICAvL+S/neWtmOiuoeaXtuWZqFxyXG4gICAgcHJpdmF0ZSBfY29ubmVjdGlvbjogTXlzcWxDb25uZWN0aW9uO1xyXG4gICAgcHJpdmF0ZSBfc3RhdHVzUmVjb3JkZXI6IE1vZHVsZVN0YXR1c1JlY29yZGVyO1xyXG4gICAgcHJpdmF0ZSBfZG93bmxvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTsgIC8v5piv5ZCm5q2j5Zyo5LiL6L29XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDkv53lrZjkuIvovb3liLDnmoTmlbDmja5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBfc2F2ZURhdGEoZGF0YTogU3RvY2tDb2RlVHlwZVtdKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGRhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBhd2FpdCB0aGlzLl9jb25uZWN0aW9uLmFzeW5jUXVlcnkoc3FsLmdldF9pZCwgW2l0ZW0uY29kZSwgaXRlbS5tYXJrZXQsIGl0ZW0uaXNJbmRleF0pO1xyXG4gICAgICAgICAgICBpZiAoaWQubGVuZ3RoID4gMCkgeyAgLy/or7TmmI7mnInmlbDmja7vvIzmm7TmlrBcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb24uYXN5bmNRdWVyeShzcWwudXBkYXRlX2RhdGEsIFtpdGVtLm5hbWUsIGlkWzBdLmlkXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl9jb25uZWN0aW9uLmFzeW5jUXVlcnkoc3FsLmluc2VydF9kYXRhLCBbaXRlbS5jb2RlLCBpdGVtLm5hbWUsIGl0ZW0ubWFya2V0LCBpdGVtLmlzSW5kZXhdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS4i+i9veWZqFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIF9kb3dubG9hZGVyKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fZG93bmxvYWRpbmcpIHsgICAvL+WmguaenOS4iuasoei/mOayoeacieaJp+ihjOWujOi/measoeWwseWPlua2iOaJp+ihjOS6hlxyXG4gICAgICAgICAgICB0aGlzLl9kb3dubG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGpvYklEID0gYXdhaXQgdGhpcy5fc3RhdHVzUmVjb3JkZXIubmV3U3RhcnRUaW1lKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX3NhdmVEYXRhKGF3YWl0IFNIX0FfQ29kZV9zanMoKS5jYXRjaChlcnIgPT4geyB0aHJvdyBuZXcgRXJyb3IoJ+S4i+i9veS4iuS6pOaJgOiCoeelqOS7o+eggeW8guW4uO+8micgKyBlcnIpIH0pKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX3NhdmVEYXRhKGF3YWl0IFNaX0FfQ29kZV9zanMoKS5jYXRjaChlcnIgPT4geyB0aHJvdyBuZXcgRXJyb3IoJ+S4i+i9vea3seS6pOaJgOiCoeelqOS7o+eggeW8guW4uO+8micgKyBlcnIpIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl9zdGF0dXNSZWNvcmRlci51cGRhdGVFbmRUaW1lKHRoaXMsIGpvYklEKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX3N0YXR1c1JlY29yZGVyLnVwZGF0ZUVycm9yKHRoaXMsIGpvYklELCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Rvd25sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGFzeW5jIG9uU3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbiA9IHRoaXMuc2VydmljZXMuTXlzcWxDb25uZWN0aW9uO1xyXG4gICAgICAgIHRoaXMuX3N0YXR1c1JlY29yZGVyID0gdGhpcy5zZXJ2aWNlcy5Nb2R1bGVTdGF0dXNSZWNvcmRlcjtcclxuICAgICAgICBhd2FpdCB0aGlzLl9jb25uZWN0aW9uLmFzeW5jUXVlcnkoc3FsLmNyZWF0ZV90YWJsZSk7ICAvL+WIm+W7uuaVsOaNruihqFxyXG5kZWJ1Z2dlclxyXG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IHRoaXMuX3N0YXR1c1JlY29yZGVyLmdldFN0YXR1cyh0aGlzKTtcclxuICAgICAgICBpZiAoc3RhdHVzID09IG51bGwgfHwgc3RhdHVzLmVycm9yICE9IG51bGwgfHwgc3RhdHVzLnN0YXJ0VGltZSA+IHN0YXR1cy5lbmRUaW1lKSB7XHJcbiAgICAgICAgICAgIC8v5aaC5p6c5rKh5LiL6L296L+H5oiW5LiK5qyh5LiL6L295Ye6546w6L+H5byC5bi477yM5YiZ56uL5Y2z6YeN5paw5LiL6L29XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2Rvd25sb2FkZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v5q+P5ZGo5pif5pyf5LqU55qEMTDngrnpkp/mm7TmlrBcclxuICAgICAgICB0aGlzLl90aW1lciA9IHNjaGVkdWxlLnNjaGVkdWxlSm9iKHsgaG91cjogMTAsIGRheU9mV2VlazogNSB9LCAoKSA9PiB0aGlzLl9kb3dubG9hZGVyKCkuY2F0Y2goZXJyID0+IHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgb25TdG9wKCkge1xyXG4gICAgICAgIHRoaXMuX3RpbWVyLmNhbmNlbCgpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==
