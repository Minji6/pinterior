package com.mycompany.pinterior.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.pinterior.dao.PinDao;
import com.mycompany.pinterior.dao.PinTagDao;
import com.mycompany.pinterior.dao.TagDao;
import com.mycompany.pinterior.entity.Pin;
import com.mycompany.pinterior.entity.Tag;

@Service
public class PinService {
    @Autowired
    private PinDao pinDao;
    @Autowired
    private TagDao tagDao;
    @Autowired
    private PinTagDao pinTagDao;

    public int insertPin(Pin pin) {
        // 1. PIN insert
        pinDao.insert(pin);

        // 2. 태그 처리
        if (pin.getTags() != null && !pin.getTags().isEmpty()) {
            for (String tagName : pin.getTags()) {
                Tag tag = tagDao.selectByTagName(tagName);
                if (tag == null) {
                    tag = new Tag();
                    tag.setTagName(tagName);
                    tagDao.insert(tag);
                }
                pinTagDao.insert(pin.getPinId(), tag.getTagId());
            }
        }
        return 1;
    }
}
