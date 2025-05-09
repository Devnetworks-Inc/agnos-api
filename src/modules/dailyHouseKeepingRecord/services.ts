import { isoStringRemoveTime } from "src/utils/helper";
import prisma from "../prisma";
const db = process.env.DATABASE_NAME

export const getHousekeepingRecordGroupByMonthYearHotel = async (startDate: Date, endDate: Date, hotelId?: number | null) => {
  const sd = isoStringRemoveTime(startDate.toISOString())
  const ed = isoStringRemoveTime(endDate.toISOString())

  const result = await prisma.$queryRawUnsafe(
    `SELECT
      dhr.year,
      dhr.month,
      dhr.hotelId,
      h.name,
      avg(dhr.occupancyPercentage) as occupancyPercentage,
      avg(dhr.ttcPercent) as ttcPercent,
      sum(dhr.departureRooms) as departureRooms,
      sum(dhr.stayOverRooms) as stayOverRooms,
      sum(dhr.dirtyRoomsLastDay) as dirtyRoomsLastDay,
      sum(dhr.dayUseRooms) as dayUseRooms,
      sum(dhr.extraCleaningRooms) as extraCleaningRooms,
      sum(dhr.noServiceRooms) as noServiceRooms,
      sum(dhr.lateCheckoutRooms) as lateCheckoutRooms,
      sum(dhr.refreshRooms) as refreshRooms,
      sum(dhr.roomsCarryOver) as roomsCarryOver,
      sum(dhr.totalCleanedRooms) as totalCleanedRooms,
      sum(dhr.totalRefreshRooms) as totalRefreshRooms,
      sum(dhr.totalHousekeepingManagerCost) as totalHousekeepingManagerCost,
      sum(dhr.totalHousekeepingCleanerCost) as totalHousekeepingCleanerCost,
      sum(dhr.totalCleanedRoomsCost) as totalCleanedRoomsCost,
      sum(dhr.totalRefreshRoomsCost) as totalRefreshRoomsCost
    FROM ${db}.daily_housekeeping_record as dhr
    LEFT JOIN ${db}.hotel as h
    ON dhr.hotelId = h.id
    WHERE date BETWEEN '${sd}' AND '${ed}'${hotelId ? ` AND hotelId=${hotelId}` : ''}
    GROUP BY dhr.year, dhr.month, dhr.hotelId, h.name
    ORDER BY year ASC, month ASC;`
  );
  return result
}