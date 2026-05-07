# Excel示例

## 示例1
```java
@Override
public void exportStudentClass(HttpServletResponse response) {
    // 以下为测试数据 具体业务改为查询数据库即可
    String realname = "小明";
    String mobile = "18800001111";

    // 创建新的Excel工作簿
    Workbook workbook = new XSSFWorkbook();
    // 创建一个工作表
    Sheet sheet = workbook.createSheet("Sheet1");
    Map<String, CellStyle> styles = ExcelBaseUtils.createStyles(workbook);

    // 在工作表中合并单元格，合并第一行的前三列
    CellRangeAddress cellRangeAddress = new CellRangeAddress(0, 1, 2, 3);
    sheet.addMergedRegion(cellRangeAddress);
    // 创建第一行并在合并的单元格中设置值
    Row row = sheet.createRow(0);
    Cell nameCell = row.createCell(0);
    nameCell.setCellValue("姓名");
    nameCell.setCellStyle(styles.get("header"));
    Cell mobileCell = row.createCell(1);
    mobileCell.setCellValue("手机号");
    mobileCell.setCellStyle(styles.get("header"));
    Cell qRCodeCell = row.createCell(2);
    qRCodeCell.setCellValue("");

    Row row1 = sheet.createRow(1);
    row1.setHeight((short) (row.getHeight() * 5));
    Cell nameValueCell = row1.createCell(0);
    nameValueCell.setCellValue(realname);
    nameValueCell.setCellStyle(styles.get("data"));
    Cell mobileValueCell = row1.createCell(1);
    mobileValueCell.setCellValue(mobile);
    mobileValueCell.setCellStyle(styles.get("data"));

    Row row2 = sheet.createRow(2);
    Cell courseCell = row2.createCell(0);
    courseCell.setCellValue("课程");
    courseCell.setCellStyle(styles.get("header"));
    Cell schoolCell = row2.createCell(1);
    schoolCell.setCellValue("校区");
    schoolCell.setCellStyle(styles.get("header"));
    Cell teacherCell = row2.createCell(2);
    teacherCell.setCellValue("教师");
    teacherCell.setCellStyle(styles.get("header"));
    Cell timeCell = row2.createCell(3);
    timeCell.setCellValue("时间");
    timeCell.setCellStyle(styles.get("header"));

    // 以下为测试数据 具体业务改为查询数据库即可
    List<UserClassExportResponseDto> userClassExportResponseDtoList = new ArrayList<>();
    userClassExportResponseDtoList.add(new UserClassExportResponseDto("课程1", "校区1", "教师1", "每周一 09:40:09~10:40:09"));
    userClassExportResponseDtoList.add(new UserClassExportResponseDto("课程2", "校区2", "教师2", "每周二 09:40:09~10:40:09"));
    userClassExportResponseDtoList.add(new UserClassExportResponseDto("课程3", "校区3", "教师3", "每周三 09:40:09~10:40:09"));

    int i = 3;
    for (UserClassExportResponseDto classInfo : userClassExportResponseDtoList) {
        Row infoRow = sheet.createRow(i);
        infoRow.setRowStyle(styles.get("data"));
        Cell courseValueCell = infoRow.createCell(0);
        courseValueCell.setCellValue(classInfo.getClassTitle());

        courseValueCell.setCellStyle(styles.get("data"));
        Cell schoolValueCell = infoRow.createCell(1);
        schoolValueCell.setCellValue(classInfo.getSchoolTitle());

        schoolValueCell.setCellStyle(styles.get("data"));
        Cell teacherValueCell = infoRow.createCell(2);
        teacherValueCell.setCellValue(classInfo.getTeacherTitle());
        teacherValueCell.setCellStyle(styles.get("data"));

        Cell timeValueCell = infoRow.createCell(3);
        timeValueCell.setCellValue(classInfo.getClassTime());
        timeValueCell.setCellStyle(styles.get("data"));

        i++;
    }

    sheet.autoSizeColumn(3);
    OutputStream out = null;
    // 导出
    try {
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        String classTitle = realname + ".xlsx";
        response.setHeader("Content-Disposition", "attachment;filename=" + new String(classTitle.getBytes("utf-8"), "ISO8859-1"));
        out = response.getOutputStream();
        workbook.write(out);
        out.flush();
        out.close();
    } catch (Exception e) {
        log.warn("下载Excel失败", e);
        throw new ServiceException("下载失败");
    } finally {
        if (workbook != null) {
            try {
                workbook.close();
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
        if (out != null) {
            try {
                out.close();
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
    }
}
```
导出效果如下：  
![](/images/backend/springboot/excel/1.png)

## 示例2
```java
@Override
public void exportSchoolClassStudent(HttpServletResponse response) {
    // 以下为测试数据 具体业务改为查询数据库即可
    String schoolTitle = "xx学校";
    String classTitle = "xx班级";
    String teacherName = "xx老师";

    // 创建新的Excel工作簿
    Workbook workbook = new XSSFWorkbook();
    // 创建一个工作表
    Sheet sheet = workbook.createSheet("Sheet1");
    Map<String, CellStyle> styles = ExcelBaseUtils.createStyles(workbook);

    // 在工作表中合并单元格
    CellRangeAddress cellRangeAddress1 = new CellRangeAddress(0, 0, 0, 18);
    CellRangeAddress cellRangeAddress2 = new CellRangeAddress(1, 1, 0, 8);
    CellRangeAddress cellRangeAddress3 = new CellRangeAddress(1, 1, 9, 18);
    CellRangeAddress cellRangeAddress4 = new CellRangeAddress(2, 3, 0, 0);
    CellRangeAddress cellRangeAddress5 = new CellRangeAddress(2, 3, 1, 1);
    CellRangeAddress cellRangeAddress6 = new CellRangeAddress(2, 3, 2, 2);
    CellRangeAddress cellRangeAddress7 = new CellRangeAddress(2, 3, 3, 3);
    CellRangeAddress cellRangeAddress8 = new CellRangeAddress(2, 2, 4, 17);
    CellRangeAddress cellRangeAddress9 = new CellRangeAddress(2, 3, 18, 18);

    sheet.addMergedRegion(cellRangeAddress1);
    sheet.addMergedRegion(cellRangeAddress2);
    sheet.addMergedRegion(cellRangeAddress3);
    sheet.addMergedRegion(cellRangeAddress4);
    sheet.addMergedRegion(cellRangeAddress5);
    sheet.addMergedRegion(cellRangeAddress6);
    sheet.addMergedRegion(cellRangeAddress7);
    sheet.addMergedRegion(cellRangeAddress8);
    sheet.addMergedRegion(cellRangeAddress9);
    Row schoolRow = sheet.createRow(0);
    Cell schoolRowCell = schoolRow.createCell(0);
    schoolRowCell.setCellValue(schoolTitle);
    schoolRowCell.setCellStyle(styles.get("data"));

    Row classInfoRow = sheet.createRow(1);
    List<String> classInfoName = Arrays.asList(classTitle, teacherName);
    for (int i = 0; i < classInfoName.size(); i++) {
        Cell cell = classInfoRow.createCell(i * 9);
        cell.setCellValue(classInfoName.get(i));
        cell.setCellStyle(styles.get("data"));
    }

    Row userRow = sheet.createRow(2);
    List<String> userRowName = Arrays.asList("序号", "姓名", "年龄", "承诺书", "日期");
    for (int i = 0; i < userRowName.size(); i++) {
        Cell cell = userRow.createCell(i);
        cell.setCellValue(userRowName.get(i));
        cell.setCellStyle(styles.get("data"));
    }
    Cell row2LastCell = userRow.createCell(18);
    row2LastCell.setCellValue("联系电话");
    row2LastCell.setCellStyle(styles.get("data"));

    // 以下为测试数据 具体业务改为查询数据库即可
    List<SchoolClassUserExportResponseDto> schoolClassUserExportResponseDtoList = new ArrayList<>();
    schoolClassUserExportResponseDtoList.add(new SchoolClassUserExportResponseDto("小明", 18, true, "18800001111"));
    schoolClassUserExportResponseDtoList.add(new SchoolClassUserExportResponseDto("小王", 28, true, "18800001111"));
    schoolClassUserExportResponseDtoList.add(new SchoolClassUserExportResponseDto("小李", 38, false, "18800001111"));
    schoolClassUserExportResponseDtoList.add(new SchoolClassUserExportResponseDto("小张", 48, false, "18800001111"));


    int rowNum = 4;
    int serialNumber = 1;
    for (SchoolClassUserExportResponseDto val : schoolClassUserExportResponseDtoList) {
        Row infoRow = sheet.createRow(rowNum);
        Cell idCell = infoRow.createCell(0);
        idCell.setCellValue(serialNumber);
        idCell.setCellStyle(styles.get("data"));
        Cell nameCell = infoRow.createCell(1);
        nameCell.setCellValue(val.getRealname());
        nameCell.setCellStyle(styles.get("data"));
        Cell ageCell = infoRow.createCell(2);
        ageCell.setCellValue(val.getAge());
        ageCell.setCellStyle(styles.get("data"));
        Cell commitmentCell = infoRow.createCell(3);
        commitmentCell.setCellValue(val.getIsPromise() ? "有" : "无");
        commitmentCell.setCellStyle(styles.get("data"));
        Cell mobileCell = infoRow.createCell(18);
        mobileCell.setCellValue(val.getMobile());
        mobileCell.setCellStyle(styles.get("data"));
        rowNum = rowNum + 1;
        serialNumber = serialNumber + 1;
    }
    sheet.autoSizeColumn(18);
    OutputStream out = null;

    // 导出
    try {
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        classTitle = classTitle + ".xlsx";
        response.setHeader("Content-Disposition", "attachment;filename=" + new String(classTitle.getBytes("utf-8"), "ISO8859-1"));
        out = response.getOutputStream();
        workbook.write(out);
        out.flush();
        out.close();
    } catch (Exception e) {
        log.warn("下载Excel失败", e);
        throw new ServiceException("下载失败");
    } finally {
        if (workbook != null) {
            try {
                workbook.close();
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
        if (out != null) {
            try {
                out.close();
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
    }
}
```
导出效果如下：  
![](/images/backend/springboot/excel/2.png)